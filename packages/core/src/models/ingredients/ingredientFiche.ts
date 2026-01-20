import { Ingredient } from './ingredientList.js';

export interface IngredientFiche {
	name: string;
	ingredientId: Ingredient;
	maxQuantity: number;
	price: number;
	quantity?: number;
}

export type IngredientFicheDTO = {
	id: number;
	quantity: number;
	maxQuantity: number;
};
