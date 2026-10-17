import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { describe, expect, it } from 'vitest';

import { getBotIngredientReserve, getBotItemReserve } from '../../src/Bot/Service/botMarket.service.js';

describe('bot market role reserves', () => {
	it('keeps fighter consumable stock instead of immediately reselling it', () => {
		const fighterReserve = getBotItemReserve(itemList[Item.FIGHT_RATION].itemId, {
			fighter: 2,
			gatherer: 0,
			explorer: 0
		});
		const noFighterReserve = getBotItemReserve(itemList[Item.FIGHT_RATION].itemId, {
			fighter: 0,
			gatherer: 1,
			explorer: 1
		});

		expect(fighterReserve).toBeGreaterThan(noFighterReserve);
		expect(fighterReserve).toBe(4);
	});

	it('keeps the same role-aware Irma target used by shopping', () => {
		expect(
			getBotItemReserve(itemList[Item.POTION_IRMA].itemId, {
				fighter: 2,
				gatherer: 1,
				explorer: 1
			})
		).toBe(10);
	});

	it('increases ingredient reserves when gatherer Dinoz exist', () => {
		const ingredient = Object.values(ingredientList).find(entry => entry.maxQuantity > 20);
		expect(ingredient).toBeDefined();
		if (!ingredient) return;

		expect(getBotIngredientReserve(ingredient.ingredientId, 1)).toBeGreaterThan(
			getBotIngredientReserve(ingredient.ingredientId, 0)
		);
	});

	it('never reserves above the ingredient inventory cap', () => {
		const ingredient = Object.values(ingredientList).find(entry => entry.maxQuantity <= 5);
		expect(ingredient).toBeDefined();
		if (!ingredient) return;

		expect(getBotIngredientReserve(ingredient.ingredientId, 7)).toBeLessThanOrEqual(ingredient.maxQuantity);
	});
});
