import { ItemType } from '../enums/ItemType.js';
import type { PassiveEffects } from '../skills/skillDetails.js';
import { SkillFightCondition } from '../skills/skillFightCondition.js';
import type { ItemEffects } from './itemEffects.js';

export interface ItemFiche {
	itemId: number;
	name: string;
	display: string;
	price: number;
	quantity?: number;
	maxQuantity: number;
	itemType: ItemType;
	effect?: ItemEffects;
	passiveEffect?: PassiveEffects;
	fightCondition?: SkillFightCondition;
	priority?: number;
	probability?: number;
	canBeEquipped: boolean;
	canBeUsedNow: boolean;
	isRare: boolean;
	sellable: boolean;
}

export interface ItemFicheDTO {
	id: number;
	price: number;
	quantity: number;
	maxQuantity: number;
}
