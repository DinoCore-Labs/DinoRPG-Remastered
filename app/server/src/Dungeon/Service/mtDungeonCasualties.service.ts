/**
 * A dead follower cannot remain an active MT dungeon combat member.
 * The run stays bound to its original leader; changing a dead leader would
 * silently orphan progress keyed by leaderDinozId. A dead leader therefore
 * triggers a safe evacuation through the normal fight settlement.
 *
 * All mutations run under withUserGameplayLock. Post-fight calls use the
 * same transaction as the attempt + MT run state transition.
 */
import type { Prisma } from '../../../../prisma/index.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

type Tx = Pick<Prisma.TransactionClient, 'dinoz'>;

export class MtDungeonCasualtiesError extends Error {
	constructor(public readonly code: 'invalid-party' | 'conflict') {
		super(`MT dungeon casualties: ${code}`);
	}
}

export async function mtDungeonLeaderIsDead(tx: Tx, identity: MtSessionIdentity): Promise<boolean> {
	const leader = await tx.dinoz.findFirst({
		where: { id: identity.leaderDinozId, userId: identity.userId, leaderId: null },
		select: { life: true }
	});
	if (!leader) throw new MtDungeonCasualtiesError('invalid-party');
	return leader.life <= 0;
}

/**
 * Dead followers become independent Dinoz, with their HP/items intact.
 * Dead leader is intentionally NOT detached (the live run belongs to it).
 * Calling this twice has no additional effect.
 */
export async function detachDeadMtDungeonFollowers(tx: Tx, identity: MtSessionIdentity): Promise<number[]> {
	const leaderDead = await mtDungeonLeaderIsDead(tx, identity);
	if (leaderDead) return []; // caller must evacuate instead of changing the run owner
	const dead = await tx.dinoz.findMany({
		where: { userId: identity.userId, leaderId: identity.leaderDinozId, life: { lte: 0 } },
		select: { id: true }
	});
	const ids = dead.map(d => d.id);
	if (!ids.length) return [];
	const removed = await tx.dinoz.updateMany({
		where: {
			userId: identity.userId,
			leaderId: identity.leaderDinozId,
			id: { in: ids },
			life: { lte: 0 }
		},
		data: { leaderId: null }
	});
	if (removed.count !== ids.length) throw new MtDungeonCasualtiesError('conflict');
	return ids;
}
