import { ElementType } from '../enums/ElementType.js';
import { ItemEffect } from '../enums/ItemEffect.js';
import { RaceEnum } from '../enums/Race.js';

export type ItemEffects =
	| {
			category: ItemEffect.HEAL | ItemEffect.RESURRECT | ItemEffect.ACTION | ItemEffect.GOLD;
			value: number;
	  }
	| {
			category: ItemEffect.EGG;
			race: RaceEnum;
	  }
	| {
			category: ItemEffect.SPHERE;
			value: ElementType;
	  }
	| {
			category: ItemEffect.SPECIAL;
			value: string;
	  };
