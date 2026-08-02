import { Ingredient, ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';

import { addIngredientToInventory } from '../../Inventory/Controller/addIngredient.controller.js';
import { prisma } from '../../prisma.js';

export async function devoreuseMidnightResetJob() {
	// 1. Reset devoreuseAttacksLeft to 3 for all users
	await prisma.user.updateMany({
		data: {
			devoreuseAttacksLeft: 3
		}
	});

	// 2. Give 3 Graînes de Dévoreuse to current controllers
	const controllers = await prisma.devoreuseControl.findMany();

	for (const control of controllers) {
		const user = await prisma.user.findUnique({
			where: { id: control.userId },
			select: { shopKeeper: true }
		});

		const currentIngredient = await prisma.userIngredients.findUnique({
			where: { ingredientId_userId: { ingredientId: Ingredient.GRAINE_DE_DEVOREUSE, userId: control.userId } }
		});

		const currentQuantity = currentIngredient?.quantity || 0;
		let maxQuantity = ingredientList[Ingredient.GRAINE_DE_DEVOREUSE].maxQuantity;
		if (user?.shopKeeper) {
			maxQuantity = Math.round(maxQuantity * 1.5);
		}

		const amountToAdd = Math.min(3, maxQuantity - currentQuantity);

		if (amountToAdd > 0) {
			await addIngredientToInventory(control.userId, Ingredient.GRAINE_DE_DEVOREUSE, amountToAdd);
		}
	}
}
