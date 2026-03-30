import { Action } from '../dinoz/dinozActions.js';
import { GatherType } from '../enums/GatherType.js';
import { ItemFiche } from '../items/itemFiche.js';
import { GatherFound } from './gatherFound.js';

export interface GatherDataV2 {
	id: string;
	action: Action;
	type: GatherType;
	size: number;
	minimumClick: number;
	apparence: string;
	label: string;
	skill?: string;
	object?: string;
	condition?: string;
	found: GatherFound[];
	cost?: ItemFiche;
}
