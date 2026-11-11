import { describe, expect, it } from 'vitest';

import {
	igorKabukiDecodedDialog,
	igorKabukiIngredientsDialog,
	igorKabukiIntroDialog
} from '../../../src/models/dialogs/data/igorKabuki.dialog.js';
import { Ingredient } from '../../../src/models/ingredients/ingredientList.js';

describe('MT Kabuki — Igor at University', () => {
	it('hands over the scroll only at the original final phase', () => {
		expect(igorKabukiIntroDialog.phases.show.effects).toEqual([{ type: 'scenario', scenario: 'kabuki', phase: 10 }]);
		expect(igorKabukiIntroDialog.phases.no?.effects).toBeUndefined();
	});

	it('waits 35 hours for deciphering and unlocks ingredient collection', () => {
		expect(igorKabukiDecodedDialog.cond).toBeDefined();
		expect(igorKabukiDecodedDialog.phases.ok.effects).toEqual([{ type: 'scenario', scenario: 'kabuki', phase: 11 }]);
	});

	it('consumes all six ingredients in the original MT order', () => {
		const ingredients: Array<[string, Ingredient, number, number]> = [
			['i1', Ingredient.MEROU_LUJIDANE, 5, 12],
			['i2', Ingredient.FEUILLES_DE_PELINAE, 5, 13],
			['i3', Ingredient.TOUFFE_DE_FOURRURE, 5, 14],
			['i4', Ingredient.SILEX_TAILLE, 2, 15],
			['i5', Ingredient.ENERGIE_AIR, 1, 16],
			['i6', Ingredient.ENERGIE_EAU, 1, 17]
		];
		for (const [phase, ingredientId, count, next] of ingredients) {
			const entry = igorKabukiIngredientsDialog.phases[phase];
			expect(entry.special).toEqual([{ type: 'useIngredient', ingredientId, count }]);
			expect(entry.effects).toEqual([{ type: 'scenario', scenario: 'kabuki', phase: next }]);
		}
	});
});
