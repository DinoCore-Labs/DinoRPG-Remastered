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
			category: ItemEffect.EGG | ItemEffect.SPHERE;
			value: string;
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
