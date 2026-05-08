import { GatherRewards } from './gatherRewards.js';

export type GatherIngredientInventoryState = {
	ingredientId: number;
	quantityBefore: number;
	quantity: number;
	isMaxQuantity: boolean;
};

export interface GatherResult {
	grid: number[][];
	rewards: GatherRewards;
	isGridComplete: boolean;
	gridCompletionGoldReward: number;
	ingredientsAtMaxQuantity: GatherIngredientInventoryState[];
}
