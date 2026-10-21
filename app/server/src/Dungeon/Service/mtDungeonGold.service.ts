/**
 * Automatic IGold pickup: one trusted replayed movement -> exactly one wallet
 * award AND one permanent room flag, committed atomically.
 *
 * MT View.hx establishes one-time flags; gen/Gameplay.hx calculates raw IGold.v.
 * The server-side gold conversion is missing from the MT archive. The imported
 * mtDungeonGoldAward 1:1 policy is explicitly PROVISIONAL, not an MT fact.
 */
import { mtDungeonGoldAward } from '@dinorpg/core/models/dungeon/dungeon.gold.js';
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

const MAX_WALLET_GOLD = 2147483647; // PostgreSQL / Prisma Int upper bound.

export class MtDungeonGoldError extends Error {
	constructor(public readonly code: 'invalid-gold' | 'stale-run' | 'invalid-wallet') {
		super(`MT dungeon gold: ${code}`);
	}
}

export interface MtDungeonGoldSettlement {
	session: MtDungeonSession;
	goldAwarded: number;
	walletGold: number;
}

/**
 * Called ONLY under withUserGameplayLock from submitMtDungeonCommands.
 * The client never supplies a gold amount, tile, flag or completed interaction.
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

	let amount: number;
	try {
		amount = mtDungeonGoldAward(item.value);
	} catch {
		throw new MtDungeonGoldError('invalid-gold');
	}
	const settled = settleMtDungeonInteraction(cfg, pendingSession, true);
	if (!settled.flags.includes(flag) || settled.pending !== null || settled.locked)
		throw new MtDungeonGoldError('invalid-gold');

	try {
		const walletGold = await prisma.$transaction(
			async tx => {
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

				if (amount === 0) return wallet.amount;
				const credited = await tx.userWallet.updateMany({
					where: {
						userId: identity.userId,
						type: 'GOLD',
						amount: { lte: MAX_WALLET_GOLD - amount }
					},
					data: { amount: { increment: amount } }
				});
				if (credited.count !== 1) throw new MtDungeonGoldError('invalid-wallet');
				return wallet.amount + amount;
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
		);
		return { session: settled, goldAwarded: amount, walletGold };
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === 'P2002' || error.code === 'P2034'))
			throw new MtDungeonGoldError('stale-run');
		throw error;
	}
}
