import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';

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
		await addIngredientToInventory(control.userId, Ingredient.GRAINE_DE_DEVOREUSE, 3);
	}
}
