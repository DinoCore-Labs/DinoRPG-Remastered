import { GatherRewards } from './gatherRewards.js';

export interface GatherResult {
	grid: number[][];
	rewards: GatherRewards;
	isGridComplete: boolean;
	gridCompletionGoldReward: number;
	ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[];
}
