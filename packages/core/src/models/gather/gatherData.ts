import { Action } from '../dinoz/dinozActions.js';
import { Condition } from '../enums/ConditionType.js';
import { GatherType } from '../enums/GatherType.js';
import { ItemFiche } from '../items/itemFiche.js';
import { GatherItems } from './gatherItems.js';

export type GatherData =
	| {
			action: Action;
			special: false;
			type:
				| GatherType.HUNT
				| GatherType.SEEK
				| GatherType.ENERGY1
				| GatherType.ENERGY2
				| GatherType.CUEILLE1
				| GatherType.CUEILLE2
				| GatherType.CUEILLE3
				| GatherType.CUEILLE4
				| GatherType.FISH;
			size: number;
			minimumClick: number;
			condition: Condition; //Skill needed
			apparence: string; //skin
			items: GatherItems[];
	  }
	| {
			action: Action;
			special: true;
			type:
				| GatherType.ANNIV
				| GatherType.LABO
				| GatherType.PARTY
				| GatherType.TICTAC
				| GatherType.XMAS
				| GatherType.DAILY;
			size: number;
			minimumClick: number;
			condition: Condition; //Skill needed
			apparence: string; //skin
			items: GatherItems[];
			cost: ItemFiche;
	  };
