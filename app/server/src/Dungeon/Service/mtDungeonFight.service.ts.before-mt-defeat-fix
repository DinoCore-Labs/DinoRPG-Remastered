/**
 * MT scenario fights, stage 10. Strictly distinct from the legacy DungeonRun.
 * Only an already-pending IScenario/DSKMonsters encounter may start a battle.
 * Server computes the outcome using Remastered's normal fight engine.
 * The adapter NEVER accepts outcome/monster ids/flags/rewards from HTTP.
 *
 * Reward settlement is not transaction-aware in Remastered. PROCESSING/REVIEW
 * deliberately block automatic retries after uncertainty, preventing duplicate
 * awards in the event of a crash. Admin reconciliation is a later step.
 */
import { randomUUID } from 'node:crypto';

import { describeMtDungeonPendingEncounter } from '@dinorpg/core/models/dungeon/dungeon.encounter.js';
import { assertMtScenarioFightBinding, mtScenarioFightIntent } from '@dinorpg/core/models/dungeon/dungeon.fight.js';
import type { MtDungeonSession } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { settleMtDungeonInteraction } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { MonsterFiche } from '@dinorpg/core/models/monster/monsterFiche.js';
import { monsterByKey } from '@dinorpg/core/models/monster/monsterKeyMap.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';

import { Prisma } from '../../../../prisma/index.js';
import { getDinozFightDataRequest } from '../../Dinoz/Controller/getDinozFight.controller.js';
import { calculateFightVsMonsters, rewardFightVsMonsters } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonFightError extends Error {
	constructor(
		public readonly code:
			| 'not-found'
			| 'not-ready'
			| 'stale-revision'
			| 'unsupported-guardian'
			| 'unknown-monster'
			| 'group-unavailable'
			| 'already-processing'
			| 'review-required'
			| 'conflict'
	) {
		super(`MT dungeon fight: ${code}`);
	}
}

const monstersByKey = monsterByKey as Readonly<Record<string, MonsterFiche | undefined>>;

function validMonsterKeys(keys: readonly string[]): MonsterFiche[] {
	if (!keys.length || keys.length > 24) throw new MtDungeonFightError('unknown-monster');
	return keys.map(key => {
		if (key === 'any' || !Object.prototype.hasOwnProperty.call(monsterByKey, key))
			throw new MtDungeonFightError('unknown-monster');
		const monster = monstersByKey[key];
		if (!monster) throw new MtDungeonFightError('unknown-monster');
		return monster;
	});
}

function asFightIntent(run: MtDungeonSession) {
	const archive = getMtDungeonArchive();
	const map = archive.configuration(run.mapId);
	const dungeonId = run.mapId.slice(0, run.mapId.lastIndexOf('_'));
	const canonical = archive.definition(dungeonId);
	const encounter = describeMtDungeonPendingEncounter({
		configuration: map,
		session: run,
		definition: canonical,
		localized: canonical,
		languageUsed: 'fr'
	});
	if (encounter?.kind === 'guardian') throw new MtDungeonFightError('unsupported-guardian');
	if (encounter?.kind !== 'scenario-combat') throw new MtDungeonFightError('not-ready');
	const intent = mtScenarioFightIntent(run, encounter);
	validMonsterKeys(intent.monsterKeys);
	return { intent, map, canonical };
}

function errorForAttemptStatus(status: string): MtDungeonFightError {
	return new MtDungeonFightError(status === 'REVIEW' ? 'review-required' : 'already-processing');
}

/** Idempotent while PREPARED. A server-generated token binds the exact revision. */
export async function prepareMtDungeonFight(identity: MtSessionIdentity, revision: number) {
	if (!Number.isSafeInteger(revision) || revision < 0) throw new MtDungeonFightError('stale-revision');
	return mtDungeonDependencies().withLock(identity.userId, async () => {
		const run = await prisma.mtDungeonRun.findFirst({
			where: {
				userId: identity.userId,
				leaderDinozId: identity.leaderDinozId,
				leaderDinoz: { userId: identity.userId }
			}
		});
		if (!run) throw new MtDungeonFightError('not-found');
		const session = await mtDungeonDependencies().repository.load(identity);
		if (!session) throw new MtDungeonFightError('not-found');
		if (session.revision !== revision) throw new MtDungeonFightError('stale-revision');
		const { intent } = asFightIntent(session);
		const old = await prisma.mtDungeonFightAttempt.findUnique({
			where: { runId_revision: { runId: run.id, revision } }
		});
		if (old) {
			if (
				old.status !== 'PREPARED' ||
				old.mapId !== intent.mapId ||
				old.pendingJson !== intent.pendingJson ||
				old.scenarioIndex !== intent.scenarioIndex ||
				JSON.stringify(old.monsterKeys) !== JSON.stringify(intent.monsterKeys)
			)
				throw errorForAttemptStatus(old.status);
			return {
				token: old.token,
				mapId: intent.mapId,
				revision,
				monsterKeys: old.monsterKeys,
				status: 'PREPARED' as const
			};
		}
		const token = randomUUID();
		try {
			await prisma.mtDungeonFightAttempt.create({
				data: {
					token,
					runId: run.id,
					mapId: intent.mapId,
					revision,
					scenarioIndex: intent.scenarioIndex,
					pendingJson: intent.pendingJson,
					monsterKeys: [...intent.monsterKeys],
					fightSeed: token,
					status: 'PREPARED'
				}
			});
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')
				throw new MtDungeonFightError('conflict');
			throw error;
		}
		return { token, mapId: intent.mapId, revision, monsterKeys: [...intent.monsterKeys], status: 'PREPARED' as const };
	});
}

/**
 * Resolves a prepared attempt once. Completed attempts return their saved
 * FightResult. PROCESSING/REVIEW are never replayed. No public win flag exists.
 */
export async function resolveMtDungeonFight(identity: MtSessionIdentity, token: string): Promise<FightResult> {
	return mtDungeonDependencies().withLock(identity.userId, async () => {
		const attempt = await prisma.mtDungeonFightAttempt.findUnique({
			where: { token },
			include: { run: { include: { leaderDinoz: { select: { userId: true } } } } }
		});
		if (
			!attempt ||
			attempt.run.userId !== identity.userId ||
			attempt.run.leaderDinozId !== identity.leaderDinozId ||
			attempt.run.leaderDinoz.userId !== identity.userId
		)
			throw new MtDungeonFightError('not-found');
		if (attempt.status === 'COMPLETED') {
			if (!attempt.result) throw new MtDungeonFightError('review-required');
			return attempt.result as unknown as FightResult;
		}
		if (attempt.status !== 'PREPARED') throw errorForAttemptStatus(attempt.status);
		const session = await mtDungeonDependencies().repository.load(identity);
		if (!session) throw new MtDungeonFightError('not-found');
		const { intent, map, canonical } = asFightIntent(session);
		assertMtScenarioFightBinding(session, {
			mapId: attempt.mapId,
			revision: attempt.revision,
			scenarioIndex: attempt.scenarioIndex,
			pendingJson: attempt.pendingJson,
			monsterKeys: attempt.monsterKeys
		});
		if (JSON.stringify(intent.monsterKeys) !== JSON.stringify(attempt.monsterKeys))
			throw new MtDungeonFightError('conflict');
		const dungeonPlace = Object.values(placeListv2).find(place => place.name === canonical.enter.place)?.placeId;
		const user = await getDinozFightDataRequest(identity.leaderDinozId, identity.userId);
		const team = user?.dinoz;
		const leader = team?.find(d => d.id === identity.leaderDinozId);
		if (
			!user ||
			!team ||
			!team.length ||
			!leader ||
			leader.leaderId !== null ||
			leader.placeId === null ||
			dungeonPlace === undefined ||
			leader.placeId !== dungeonPlace ||
			team.some(
				d =>
					d.life <= 0 ||
					d.state !== null ||
					d.canRename ||
					!d.fight ||
					d.concentration !== null ||
					d.placeId !== leader.placeId ||
					(d.id !== leader.id && d.leaderId !== leader.id)
			)
		)
			throw new MtDungeonFightError('group-unavailable');
		const monsters = validMonsterKeys(attempt.monsterKeys);
		const claim = await prisma.mtDungeonFightAttempt.updateMany({
			where: { id: attempt.id, status: 'PREPARED' },
			data: { status: 'PROCESSING' }
		});
		if (claim.count !== 1) throw new MtDungeonFightError('already-processing');
		try {
			const fight = calculateFightVsMonsters(
				[leader, ...team.filter(d => d.id !== leader.id)],
				user,
				leader.placeId,
				monsters,
				attempt.fightSeed
			);
			// The archived dungeon gold formula is not recovered. NEVER apply overworld gold.
			const result = await rewardFightVsMonsters(
				[leader, ...team.filter(d => d.id !== leader.id)],
				monsters,
				fight,
				leader.placeId,
				user,
				{
					disableGoldReward: true,
					disableMonsterHuntReward: true
				}
			);
			const settled = settleMtDungeonInteraction(map, session, result.result);
			const stored = JSON.parse(JSON.stringify(result)) as Prisma.InputJsonValue;
			await prisma.$transaction(async tx => {
				const updated = await tx.mtDungeonRun.updateMany({
					where: {
						id: attempt.runId,
						userId: identity.userId,
						leaderDinozId: identity.leaderDinozId,
						revision: session.revision
					},
					data: {
						revision: settled.revision,
						x: settled.position.x,
						y: settled.position.y,
						l: settled.position.l,
						keys: [...settled.keys],
						flags: [...settled.flags],
						fog: settled.fog === null ? null : Uint8Array.from(settled.fog),
						locked: settled.locked,
						pending: Prisma.DbNull,
						stageStates: settled.stageStates as unknown as Prisma.InputJsonValue
					}
				});
				if (updated.count !== 1) throw new MtDungeonFightError('conflict');
				await tx.mtDungeonFightAttempt.update({
					where: { id: attempt.id },
					data: { status: 'COMPLETED', result: stored }
				});
			});
			return result;
		} catch (error) {
			// Reward mutations might already exist. Never put the attempt back in PREPARED.
			try {
				await prisma.mtDungeonFightAttempt.updateMany({
					where: { id: attempt.id, status: 'PROCESSING' },
					data: { status: 'REVIEW' }
				});
			} catch {
				/* PROCESSING also blocks replay; manual recovery required. */
			}
			throw error;
		}
	});
}
