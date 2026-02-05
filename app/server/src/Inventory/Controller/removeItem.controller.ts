import { prisma } from '../../prisma.js';

export const removeItem = async (userId: string, itemId: number, quantity: number) => {
	const item = await prisma.userItems.update({
		where: {
			itemId_userId: {
				itemId,
				userId
			}
		},
		data: {
			quantity: {
				decrement: quantity
			}
		}
	});

	// Delete item if quantity is <= 0
	if (item.quantity <= 0) {
		await prisma.userItems.delete({
			where: {
				itemId_userId: {
					itemId,
					userId
				}
			}
		});
	}
};
