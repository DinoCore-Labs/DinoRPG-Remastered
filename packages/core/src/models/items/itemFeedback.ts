import { DinozFiche } from '../dinoz/dinozFiche.js';
import { ItemEffect } from '../enums/ItemEffect.js';

export type ItemFeedBack =
	| {
			category: ItemEffect.HEAL | ItemEffect.GOLD | ItemEffect.ACTION;
			value: number;
	  }
	| {
			category: ItemEffect.RESURRECT;
	  }
	| {
			category: ItemEffect.SPHERE;
			value: string;
	  }
	| {
			category: ItemEffect.EGG;
			value: string;
			dinoz: DinozFiche;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
			effect: string;
			quantity: number;
	  }
	| {
			category: ItemEffect.QUEST;
			value: string;
	  };
