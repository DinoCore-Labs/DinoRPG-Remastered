/**
 * Stage 11: atomic MT IScenario text, inventory and collection settlement.
 * The archive's French definition alone controls the reward; localized XML
 * controls the message only. No HTTP field can specify an item or a result.
 *
 * Unsupported MT scenario collection keys (notably `demon`) remain pending.
 * Guardian fights, IGold, IHeal and blocked scenarios remain out of scope.
 */
import { normalizeMtDungeonLanguage } from '@dinorpg/core/models/dungeon/dungeon.catalog.js';
import { mtScenarioRewardIntent } from '@dinorpg/core/models/dungeon/dungeon.scenarioReward.js';
import { type MtDungeonSession, settleMtDungeonInteraction } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { getMtDungeonArchive, mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonScenarioSettlementError extends Error {
	constructor(
		public readonly code: 'not-found' | 'stale-revision' | 'unsupported-original-reward' | 'inventory-full' | 'conflict'
	) {
		super(`MT dungeon scenario settlement: ${code}`);
		this.name = 'MtDungeonScenarioSettlementError';
	}
}

const itemsByOriginalDisplay = new Map<string, { itemId: number; maxQuantity: number }>();
const duplicateDisplays = new Set<string>();
for (const item of Object.values(itemList)) {
	if (!item.display) continue;
	if (itemsByOriginalDisplay.has(item.display)) duplicateDisplays.add(item.display);
	else itemsByOriginalDisplay.set(item.display, { itemId: item.itemId, maxQuantity: item.maxQuantity });
}

function resolveOriginalItem(key: string) {
	if (duplicateDisplays.has(key)) throw new MtDungeonScenarioSettlementError('unsupported-original-reward');
	const item = itemsByOriginalDisplay.get(key);
	if (!item || !Number.isSafeInteger(item.maxQuantity) || item.maxQuantity < 1)
		throw new MtDungeonScenarioSettlementError('unsupported-original-reward');
	return item;
}

/** Update only the server-owned gameplay fields, exactly like the MT run CAS. */
function savedRunFields(result: MtDungeonSession) {
	return {
		revision: result.revision,
		x: result.position.x,
		y: result.position.y,
		l: result.position.l,
		keys: [...result.keys],
		flags: [...result.flags],
		fog: result.fog === null ? null : Uint8Array.from(result.fog),
		locked: result.locked,
		pending: Prisma.DbNull,
		stageStates: result.stageStates as unknown as Prisma.InputJsonValue
	};
}

/**
 * Only a validated server-side pending IScenario and an exact revision can
 * enter here. CAS and reward updates share a serializable transaction, so a
 * failure rolls back *both* the item's award and the scenario flag.
 */
export async function resolveMtDungeonScenarioReward(
	identity: MtSessionIdentity,
	expectedRevision: number,
	language: unknown
) {
	if (!Number.isSafeInteger(expectedRevision) || expectedRevision < 0)
		throw new MtDungeonScenarioSettlementError('stale-revision');
	return mtDungeonDependencies().withLock(identity.userId, async () => {
		const archive = getMtDungeonArchive();
		const session = await mtDungeonDependencies().repository.load(identity);
		if (!session) throw new MtDungeonScenarioSettlementError('not-found');
		if (session.revision !== expectedRevision) throw new MtDungeonScenarioSettlementError('stale-revision');
		const map = archive.configuration(session.mapId);
		const dungeonId = session.mapId.slice(0, session.mapId.lastIndexOf('_'));
		const original = archive.definition(dungeonId);
		const translated = archive.localizedDefinition(dungeonId, normalizeMtDungeonLanguage(language));
		const intent = mtScenarioRewardIntent({
			configuration: map,
			session,
			definition: original,
			localized: translated.definition,
			languageUsed: translated.languageUsed
		});

		// Resolve every reward to a known Remastered record BEFORE any mutation.
		const effect = intent.effect;
		const item = effect.type === 'object' ? resolveOriginalItem(effect.key) : null;
		const rewardId = effect.type === 'collection' ? rewardIdByKey[effect.key] : undefined;
		if (effect.type === 'collection' && rewardId === undefined)
			throw new MtDungeonScenarioSettlementError('unsupported-original-reward');
		if (effect.type === 'object' && (!item || effect.count > item.maxQuantity))
			throw new MtDungeonScenarioSettlementError('unsupported-original-reward');

		const settled = settleMtDungeonInteraction(map, session, true);
		try {
			await prisma.$transaction(
				async tx => {
					// Verify ownership inside the same DB transaction as settlement.
					const row = await tx.mtDungeonRun.findFirst({
						where: {
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							leaderDinoz: { userId: identity.userId }
						},
						select: { id: true, revision: true, mapId: true }
					});
					if (!row) throw new MtDungeonScenarioSettlementError('not-found');
					if (row.revision !== session.revision || row.mapId !== session.mapId)
						throw new MtDungeonScenarioSettlementError('conflict');
					const changed = await tx.mtDungeonRun.updateMany({
						where: {
							id: row.id,
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							revision: session.revision,
							mapId: session.mapId
						},
						data: savedRunFields(settled)
					});
					if (changed.count !== 1) throw new MtDungeonScenarioSettlementError('conflict');
					if (effect.type === 'object') {
						const itemId = item!.itemId;
						const current = await tx.userItems.findUnique({
							where: { itemId_userId: { itemId, userId: identity.userId } },
							select: { quantity: true }
						});
						// Never silently give fewer items than the original chest specifies.
						if ((current?.quantity ?? 0) + effect.count > item!.maxQuantity)
							throw new MtDungeonScenarioSettlementError('inventory-full');
						await tx.userItems.upsert({
							where: { itemId_userId: { itemId, userId: identity.userId } },
							create: { itemId, userId: identity.userId, quantity: effect.count },
							update: { quantity: { increment: effect.count } }
						});
					} else if (effect.type === 'collection') {
						await tx.userRewards.upsert({
							where: { rewardId_userId: { rewardId: rewardId!, userId: identity.userId } },
							create: { rewardId: rewardId!, userId: identity.userId },
							update: {}
						});
					}
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
			);
		} catch (error) {
			if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034'))
				throw new MtDungeonScenarioSettlementError('conflict');
			throw error;
		}
		return {
			session: settled,
			message: intent.text,
			messageIcon: intent.messageIcon,
			languageUsed: intent.languageUsed,
			// Shown ONLY after committed award; no hidden-item preview.
			reward:
				effect.type === 'object'
					? { type: 'item' as const, itemId: item!.itemId, quantity: effect.count }
					: effect.type === 'collection'
						? { type: 'collection' as const, rewardId: rewardId! }
						: { type: 'none' as const }
		};
	});
}
