import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';

import { prisma } from '../../prisma.js';

export type BotInventoryForecast = {
	items: Map<number, number>;
	ingredients: Map<number, number>;
};

function addReserve(map: Map<number, number>, id: number, quantity: number) {
	map.set(id, (map.get(id) ?? 0) + quantity);
}

export async function getBotInventoryForecast(userId: string): Promise<BotInventoryForecast> {
	const dinoz = await prisma.dinoz.findMany({
		where: {
			userId
		},
		select: {
			missions: {
				where: {
					isCompleted: false
				},
				select: {
					missionKey: true,
					progression: true
				}
			}
		}
	});

	const items = new Map<number, number>();
	const ingredients = new Map<number, number>();

	for (const member of dinoz) {
		for (const missionState of member.missions) {
			const definition = missionList.find(mission => mission.key === missionState.missionKey);
			const goal = definition?.goals[missionState.progression];
			if (!goal) continue;

			if (goal.type === 'USE_ITEM') {
				const item = Object.values(itemList).find(entry => entry.name === goal.itemKey);
				if (item) {
					addReserve(items, item.itemId, goal.quantity);
				}
			}

			if (goal.type === 'USE_INGREDIENT') {
				const ingredient = Object.values(ingredientList).find(entry => entry.name === goal.ingredientKey);
				if (ingredient) {
					addReserve(ingredients, ingredient.ingredientId, goal.quantity);
				}
			}
		}
	}

	return {
		items,
		ingredients
	};
}
