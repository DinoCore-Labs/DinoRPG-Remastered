import { prisma } from '../../prisma.js';

export function addIngredientToInventory(userId: string, ingredientId: number, quantity: number) {
	return prisma.userIngredients.upsert({
		where: { ingredientId_userId: { ingredientId, userId } },
		create: { userId, ingredientId, quantity: quantity },
		update: { quantity: { increment: quantity } }
	});
}
