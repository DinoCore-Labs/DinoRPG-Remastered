import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';
import { DinozStatusId } from './statusList.js';

export type DigReward =
	| { type: 'status'; statusId: DinozStatusId }
	| { type: 'item'; itemId: number; quantity: number }
	| { type: 'scenario'; scenarioKey: string; progression: number };

export type DigTreasure = {
	id: string;
	place: PlaceEnum;
	cond?: Condition;
	rewards: DigReward[];
};

export type DigResponse = {
	treasureId: string | null;
	rewards: Array<
		| { type: 'gold'; amount: number }
		| { type: 'status'; statusId: number }
		| { type: 'item'; itemId: number; quantity: number }
	>;
};
