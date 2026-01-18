import { prisma } from '../../prisma.js';

export async function getUserInventoryDataRequest(userId: string) {
	const inventory = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			items: {
				select: {
					itemId: true,
					quantity: true
				}
			}
		}
	});

	return inventory;
}
