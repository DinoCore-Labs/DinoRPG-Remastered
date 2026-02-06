import { prisma } from '../../prisma.js';

export async function getUserIngredientDataRequest(userId: string) {
	const ingredients = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			}
		}
	});
	return ingredients;
}
