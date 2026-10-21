/**
 * True MT dungeon overworld exits, independent of development tools.
 * No completion prize is invented: the original server's completion reward
 * algorithm is absent from the Motion Twin archives. Scenario/loot rewards
 * already committed before this exit remain in the player's account.
 */
import { normalizeMtDungeonLanguage } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { MtDungeonWorldExitError, planMtDungeonWorldExit } from '@dinorpg/core/models/dungeon/dungeon.worldExit.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { saveMtDungeonProgress } from './mtDungeonProgress.service.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonWorldExitSettlementError extends Error {
	constructor(public readonly code: 'not-found' | 'conflict' | 'pending-attempt' | 'invalid-party' | 'unknown-place') {
		super(`MT dungeon world exit: ${code}`);
		this.name = 'MtDungeonWorldExitSettlementError';
	}
}

/** Run, discoveries and group location change together, or nothing changes. */
export async function completeMtDungeonWorldExit(
	identity: MtSessionIdentity,
	expectedRevision: number,
	language: unknown
): Promise<{
	kind: 'return' | 'complete';
	placeId: number;
	text: string;
	languageUsed: string;
}> {
	if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
		throw new MtDungeonWorldExitSettlementError('conflict');
	const deps = mtDungeonDependencies();
	return deps.withLock(identity.userId, async () => {
		const archive = getMtDungeonArchive();
		const session = await deps.repository.load(identity);
		if (!session) throw new MtDungeonWorldExitSettlementError('not-found');
		if (session.revision !== expectedRevision) throw new MtDungeonWorldExitSettlementError('conflict');
		const cfg = deps.getConfiguration(session.mapId);
		const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
		const original = archive.definition(dungeonId);
		const plan = planMtDungeonWorldExit(original, cfg, session);
		const destination = Object.values(placeListv2).find(place => place.name === plan.destinationPlaceKey);
		if (!destination) throw new MtDungeonWorldExitSettlementError('unknown-place');
		const translated = archive.localizedDefinition(plan.dungeonId, normalizeMtDungeonLanguage(language));

		try {
			await prisma.$transaction(
				async tx => {
					const run = await tx.mtDungeonRun.findFirst({
						where: {
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							leaderDinoz: { userId: identity.userId }
						},
						select: { id: true, revision: true, mapId: true }
					});
					if (!run) throw new MtDungeonWorldExitSettlementError('not-found');
					if (run.revision !== expectedRevision || run.mapId !== session.mapId)
						throw new MtDungeonWorldExitSettlementError('conflict');
					// An unresolved fight MUST NOT be silently discarded on exiting.
					const unsafe = await tx.mtDungeonFightAttempt.count({
						where: { runId: run.id, status: { in: ['PREPARED', 'PROCESSING', 'REVIEW'] } }
					});
					if (unsafe > 0) throw new MtDungeonWorldExitSettlementError('pending-attempt');
					const members = await tx.dinoz.findMany({
						where: {
							userId: identity.userId,
							OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
						},
						select: { id: true, leaderId: true }
					});
					if (!members.some(member => member.id === identity.leaderDinozId && member.leaderId === null))
						throw new MtDungeonWorldExitSettlementError('invalid-party');

					await saveMtDungeonProgress(tx, identity, session, cfg);
					const moved = await tx.dinoz.updateMany({
						where: {
							userId: identity.userId,
							OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
						},
						data: { placeId: destination.placeId }
					});
					if (moved.count !== members.length) throw new MtDungeonWorldExitSettlementError('invalid-party');
					const removed = await tx.mtDungeonRun.deleteMany({
						where: {
							id: run.id,
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							mapId: session.mapId,
							revision: expectedRevision
						}
					});
					if (removed.count !== 1) throw new MtDungeonWorldExitSettlementError('conflict');
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
			);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034'))
				throw new MtDungeonWorldExitSettlementError('conflict');
			throw error;
		}
		return {
			kind: plan.kind,
			placeId: destination.placeId,
			text: translated.definition.exit.text,
			languageUsed: translated.languageUsed
		};
	});
}

export { MtDungeonWorldExitError };
