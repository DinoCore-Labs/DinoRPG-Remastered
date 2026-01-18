import { prisma } from '../../prisma.js';

export function addItemToInventory(userId: string, itemId: number, quantity: number) {
	return prisma.userItems.upsert({
		where: { itemId_userId: { itemId, userId } },
		create: { userId, itemId, quantity: quantity },
		update: { quantity: { increment: quantity } }
	});
}
