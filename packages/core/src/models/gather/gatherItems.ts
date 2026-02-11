import { Condition } from '../enums/ConditionType.js';

export interface GatherItems {
	type: 'ingredient' | 'item';
	ingredientId: number[];
	startQuantity: number;
	condition?: Condition;
}
