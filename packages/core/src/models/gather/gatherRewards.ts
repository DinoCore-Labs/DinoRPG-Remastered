import { IngredientFiche } from '../ingredients/ingredientFiche.js';
import { ItemFicheDTO } from '../items/itemFiche.js';

export interface GatherRewards {
	item: ItemFicheDTO[];
	ingredients: IngredientFiche[];
}

export const GRID_FINISHED_GOLD_REWARD = 1000;
