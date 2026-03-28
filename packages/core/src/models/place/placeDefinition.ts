import { Condition } from '../conditions/conditions.js';
import { GatherType } from '../enums/GatherType.js';
import { GroundEnum } from '../enums/GroundEnum.js';
import { MapZone } from '../enums/MapZone.js';
import { PlaceEnum } from '../enums/PlaceEnum.js';

export type PlaceConditionSource = string | Condition;

export type PlaceMoveInput = {
	target: PlaceEnum;
	condition?: PlaceConditionSource;
	difficulty?: number;
};

export type PlaceMove = {
	target: PlaceEnum;
	condition?: Condition;
	rawCondition?: string;
	difficulty: number;
};

export type PlaceDefinitionInput = {
	placeId: PlaceEnum;
	name: string;
	map: MapZone;

	condition?: PlaceConditionSource;

	moves?: PlaceMoveInput[];

	gotoPlaceId?: PlaceEnum;
	realPlaceId?: PlaceEnum;

	hide?: boolean;
	disabled?: boolean;
	activeKey?: string;

	gathers?: GatherType[];

	ground?: GroundEnum;
	background?: string;
	top?: number;
	bottom?: number;

	itinerant?: boolean;
};

export type PlaceDefinition = Omit<PlaceDefinitionInput, 'condition' | 'moves'> & {
	condition?: Condition;
	rawCondition?: string;
	moves: PlaceMove[];
};
