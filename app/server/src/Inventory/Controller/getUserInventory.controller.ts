import { prisma } from '../../prisma.js';

export async function getUserInventoryDataRequest(userId: string) {
	const inventory = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			//shopKeeper: true,
			items: {
				select: {
					itemId: true,
					quantity: true
				},
				where: {
					quantity: {
						gt: 0
					}
				}
			},
			rewards: {
				select: { rewardId: true }
			}
		}
	});

	return inventory;
}
