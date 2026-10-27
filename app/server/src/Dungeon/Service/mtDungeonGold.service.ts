/**
 * Automatic IGold pickup: the per-player pickup flag, globally shared finite
 * MT dungeon gold pool, and wallet award commit in ONE serializable transaction.
 *
 * Archive facts: MT <d gold="..."> initializes the reserve; IGold.v is an
 * unsigned 8-bit map weight. The payout formula is a documented Remastered
 * policy, NOT the original MT server formula (not present in the archive).
 * No implicit reserve reset or refill is performed.
 */
import { mtDungeonGoldAward } from '@dinorpg/core/models/dungeon/dungeon.gold.js';
import { MT_DUNGEON_DEFINITIONS } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';
import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import {
	isValidMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration,
	settleMtDungeonInteraction
} from '@dinorpg/core/models/dungeon/dungeon.session.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

const MAX_WALLET_GOLD = 2147483647;
const MAX_SERIALIZATION_ATTEMPTS = 5;

export class MtDungeonGoldError extends Error {
	constructor(public readonly code: 'invalid-gold' | 'stale-run' | 'invalid-wallet' | 'pool-conflict') {
		super(`MT dungeon gold: ${code}`);
	}
}

export interface MtDungeonGoldSettlement {
	session: MtDungeonSession;
	goldAwarded: number;
	walletGold: number;
}

function dungeonGoldFor(mapId: string): { dungeonId: string; initialGold: number } {
	const match = /^([a-z][a-z0-9]*)_(0|[1-9][0-9]*)$/.exec(mapId);
	const dungeonId = match?.[1];
	const definition = MT_DUNGEON_DEFINITIONS.fr.find(value => value.id === dungeonId);
	if (!dungeonId || !definition || !Number.isSafeInteger(definition.gold) || definition.gold < 0)
		throw new MtDungeonGoldError('invalid-gold');
	return { dungeonId, initialGold: definition.gold };
}

function serializationConflict(error: unknown): boolean {
	return error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034');
}

/**
 * Called ONLY under withUserGameplayLock from submitMtDungeonCommands.
 * The client cannot supply any amount, map, room, pool identity or reward.
 */
export async function settleMtDungeonGoldArrival(
	identity: MtSessionIdentity,
	expectedRevision: number,
	pendingSession: MtDungeonSession,
	cfg: MtSessionConfiguration
): Promise<MtDungeonGoldSettlement> {
	const event = pendingSession.pending;
	if (
		!isValidMtDungeonSession(pendingSession, cfg) ||
		!event ||
		event.kind !== 'gold' ||
		!pendingSession.locked ||
		!Number.isSafeInteger(expectedRevision) ||
		pendingSession.revision !== expectedRevision + 1 ||
		event.to.l !== event.from.l ||
		Math.abs(event.to.x - event.from.x) + Math.abs(event.to.y - event.from.y) !== 1 ||
		event.itemValue === null
	)
		throw new MtDungeonGoldError('invalid-gold');

	const item = cfg.map.levels[event.to.l]?.rooms.find(
		room => room.item?.kind === 'IGold' && room.item.x === event.to.x && room.item.y === event.to.y
	)?.item;
	const flag = getMtFlagIndex(cfg.map, event.to.l, event.to.x, event.to.y);
	if (
		!item ||
		item.kind !== 'IGold' ||
		item.value !== event.itemValue ||
		event.flag !== flag ||
		pendingSession.flags.includes(flag)
	)
		throw new MtDungeonGoldError('invalid-gold');

	const { dungeonId, initialGold } = dungeonGoldFor(cfg.mapId);
	const settled = settleMtDungeonInteraction(cfg, pendingSession, true);
	if (!settled.flags.includes(flag) || settled.pending !== null || settled.locked)
		throw new MtDungeonGoldError('invalid-gold');

	for (let attempt = 0; attempt < MAX_SERIALIZATION_ATTEMPTS; attempt++) {
		try {
			const award = await prisma.$transaction(
				async tx => {
					// Optimistic anti-replay: an unsuccessful CAS aborts the entire transaction.
					const updated = await tx.mtDungeonRun.updateMany({
						where: {
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							mapId: cfg.mapId,
							revision: expectedRevision,
							leaderDinoz: { userId: identity.userId }
						},
						data: {
							revision: settled.revision,
							x: settled.position.x,
							y: settled.position.y,
							l: settled.position.l,
							keys: [...settled.keys],
							flags: [...settled.flags],
							fog: settled.fog === null ? null : Uint8Array.from(settled.fog),
							locked: false,
							pending: Prisma.DbNull,
							stageStates: settled.stageStates as unknown as Prisma.InputJsonValue
						}
					});
					if (updated.count !== 1) throw new MtDungeonGoldError('stale-run');

					// Upsert is protected by SERIALIZABLE; concurrent first entries are retried.
					const pool = await tx.mtDungeonGoldPool.upsert({
						where: { dungeonId },
						create: { dungeonId, initialGold, remainingGold: initialGold },
						update: {},
						select: { initialGold: true, remainingGold: true }
					});
					if (pool.initialGold !== initialGold) throw new MtDungeonGoldError('invalid-gold');
					let amount: number;
					try {
						amount = mtDungeonGoldAward(item.value, pool.remainingGold, pool.initialGold);
					} catch {
						throw new MtDungeonGoldError('invalid-gold');
					}

					const wallet = await tx.userWallet.findUnique({
						where: { userId_type: { userId: identity.userId, type: 'GOLD' } },
						select: { amount: true }
					});
					if (
						!wallet ||
						!Number.isSafeInteger(wallet.amount) ||
						wallet.amount < 0 ||
						wallet.amount > MAX_WALLET_GOLD - amount
					)
						throw new MtDungeonGoldError('invalid-wallet');

					if (amount === 0) return { goldAwarded: 0, walletGold: wallet.amount };

					// Compare-and-swap the shared balance, never allow a negative reserve.
					const debited = await tx.mtDungeonGoldPool.updateMany({
						where: { dungeonId, remainingGold: pool.remainingGold },
						data: { remainingGold: { decrement: amount } }
					});
					if (debited.count !== 1) throw new MtDungeonGoldError('pool-conflict');
					const credited = await tx.userWallet.updateMany({
						where: {
							userId: identity.userId,
							type: 'GOLD',
							amount: { lte: MAX_WALLET_GOLD - amount }
						},
						data: { amount: { increment: amount } }
					});
					if (credited.count !== 1) throw new MtDungeonGoldError('invalid-wallet');
					return { goldAwarded: amount, walletGold: wallet.amount + amount };
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
			);
			return { session: settled, ...award };
		} catch (error) {
			if (serializationConflict(error) || (error instanceof MtDungeonGoldError && error.code === 'pool-conflict')) {
				if (attempt + 1 < MAX_SERIALIZATION_ATTEMPTS) continue;
				throw new MtDungeonGoldError('pool-conflict');
			}
			throw error;
		}
	}
	throw new MtDungeonGoldError('pool-conflict');
}
