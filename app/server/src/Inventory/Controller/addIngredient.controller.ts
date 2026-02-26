import { prisma } from '../../prisma.js';

export function addIngredientToInventory(userId: string, ingredientId: number, quantity: number) {
	return prisma.userIngredients.upsert({
		where: { ingredientId_userId: { ingredientId, userId } },
		create: { userId, ingredientId, quantity: quantity },
		update: { quantity: { increment: quantity } }
	});
}

export const decreaseIngredientQuantity = async (userId: string, ingredientId: number, quantity: number) => {
	await prisma.userIngredients.update({
		where: {
			ingredientId_userId: {
				ingredientId,
				userId
			}
		},
		data: {
			quantity: {
				decrement: quantity
			}
		}
	});
};
