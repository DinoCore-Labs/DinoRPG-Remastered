import { Ingredient, ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { addIngredientToInventory } from '../../Inventory/Controller/addIngredient.controller.js';
import { newNotif } from '../../Notification/Service/notification.service.js';
import { prisma } from '../../prisma.js';

export async function devourerMidnightResetJob() {
	// 1. Reset devourerAttacksLeft to 3 for all users
	await prisma.user.updateMany({
		data: {
			devourerAttacksLeft: 3
		}
	});

	// 2. Give 3 Graînes de Dévoreuse to current controllers
	const controllers = await prisma.devourerControl.findMany();
	const userSeedGains = new Map<string, number>();

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
			userSeedGains.set(control.userId, (userSeedGains.get(control.userId) || 0) + amountToAdd);
		}
	}

	for (const [userId, totalAmount] of userSeedGains.entries()) {
		await newNotif(userId, NotificationType.DEVOURER_SEEDS_GATHERED, JSON.stringify({ amount: totalAmount }));
	}

	// 3. Clean up Devourer history older than 48 hours
	const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
	await prisma.fightArchive.deleteMany({
		where: {
			devourerPlaceId: { not: null },
			createdDate: { lt: twoDaysAgo }
		}
	});
}
