/**
 * Block regular HP restoration while a Dinoz belongs to an active MT dungeon
 * party (leader or follower). Call under the user's gameplay lock for mutations.
 */
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../prisma/index.js';
import { prisma } from '../prisma.js';

export async function assertNoMtDungeonHealing(
	userId: string,
	dinozId: number,
	db: Pick<Prisma.TransactionClient, 'dinoz' | 'mtDungeonRun'> = prisma
): Promise<void> {
	const member = await db.dinoz.findFirst({
		where: { id: dinozId, userId },
		select: { leaderId: true }
	});
	if (!member) return; // Existing ownership check supplies the appropriate error.
	const leaders = [dinozId, ...(member.leaderId === null ? [] : [member.leaderId])];
	const active = await db.mtDungeonRun.findFirst({
		where: { userId, leaderDinozId: { in: leaders } },
		select: { id: true }
	});
	if (active) throw new ExpectedError('dungeonHealingBlocked', { statusCode: 403 });
}
