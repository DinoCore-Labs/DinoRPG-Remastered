/** Dungeon-only action restoration. Every exhausted member consumes ONE real Irma.
 * The run revision and all item/action mutations share one serializable transaction.
 */
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { mtDungeonDependencies } from './mtDungeonRuntime.service.js';
import type { MtSessionIdentity } from './mtDungeonSession.service.js';

export class MtDungeonIrmaError extends Error {
	constructor(
		public readonly code:
			'not-found' | 'conflict' | 'party-defeated' | 'invalid-party' | 'actions-ready' | 'not-enough-irma'
	) {
		super(`MT dungeon Irma: ${code}`);
	}
}

export async function useMtDungeonIrma(
	identity: MtSessionIdentity,
	revision: number
): Promise<{ used: number; stock: number }> {
	if (!Number.isSafeInteger(revision) || revision < 0) throw new MtDungeonIrmaError('conflict');
	const deps = mtDungeonDependencies();
	return deps
		.withLock(identity.userId, async () =>
			prisma.$transaction(
				async tx => {
					const run = await tx.mtDungeonRun.findFirst({
						where: {
							userId: identity.userId,
							leaderDinozId: identity.leaderDinozId,
							leaderDinoz: { userId: identity.userId }
						},
						select: { id: true, revision: true }
					});
					if (!run) throw new MtDungeonIrmaError('not-found');
					if (run.revision !== revision) throw new MtDungeonIrmaError('conflict');
					const members = await tx.dinoz.findMany({
						where: {
							userId: identity.userId,
							OR: [{ id: identity.leaderDinozId }, { leaderId: identity.leaderDinozId }]
						},
						select: { id: true, leaderId: true, life: true, fight: true }
					});
					if (!members.some(member => member.id === identity.leaderDinozId && member.leaderId === null))
						throw new MtDungeonIrmaError('invalid-party');
					if (members.every(member => member.life <= 0)) throw new MtDungeonIrmaError('party-defeated');
					const exhaustedIds = members.filter(member => member.life > 0 && !member.fight).map(member => member.id);
					if (!exhaustedIds.length) throw new MtDungeonIrmaError('actions-ready');
					const irmaId = itemList[Item.POTION_IRMA].itemId;
					const stock = await tx.userItems.findUnique({
						where: { itemId_userId: { itemId: irmaId, userId: identity.userId } },
						select: { quantity: true }
					});
					if (!stock || stock.quantity < exhaustedIds.length) throw new MtDungeonIrmaError('not-enough-irma');
					const spent = await tx.userItems.updateMany({
						where: { itemId: irmaId, userId: identity.userId, quantity: { gte: exhaustedIds.length } },
						data: { quantity: { decrement: exhaustedIds.length } }
					});
					if (spent.count !== 1) throw new MtDungeonIrmaError('conflict');
					const restored = await tx.dinoz.updateMany({
						where: { userId: identity.userId, id: { in: exhaustedIds }, fight: false },
						data: { fight: true }
					});
					if (restored.count !== exhaustedIds.length) throw new MtDungeonIrmaError('conflict');
					await tx.userTracking.upsert({
						where: { stat_userId: { stat: StatTracking.ITEM_USED, userId: identity.userId } },
						update: { quantity: { increment: exhaustedIds.length } },
						create: { stat: StatTracking.ITEM_USED, userId: identity.userId, quantity: exhaustedIds.length }
					});
					return { used: exhaustedIds.length, stock: stock.quantity - exhaustedIds.length };
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
			)
		)
		.catch(error => {
			if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')
				throw new MtDungeonIrmaError('conflict');
			throw error;
		});
}
