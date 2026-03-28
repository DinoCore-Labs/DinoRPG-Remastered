import { Condition } from '../conditions/conditions.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';

export type PlaceMove = {
	target: PlaceEnum;
	condition?: Condition;
	difficulty?: number;
};
