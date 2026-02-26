import { Condition } from '../enums/ConditionType.js';
import { ItemType } from '../enums/ItemType.js';
import { ShopType } from '../enums/ShopType.js';

export type ShopFiche = {
	shopId: number;
	placeId: number;
	name: string;
	type: ShopType;
	listItemsSold: ItemShopFiche[];
	condition?: Condition;
};

export type ItemShopFiche =
	| {
			id: number;
			price: number;
			type: ItemShopType.INGREDIENT;
			quantity?: number;
	  }
	| {
			id: number;
			price: number;
			type: ItemShopType.ITEM;
			quantity?: number;
			itemType?: ItemType;
	  };

export enum ItemShopType {
	INGREDIENT,
	ITEM
}

export interface ShopFeedBack {
	itemId: number;
	quantity: number;
	gold?: number;
}

export interface ShopDTO {
	itemId: number;
	quantity: number;
}
