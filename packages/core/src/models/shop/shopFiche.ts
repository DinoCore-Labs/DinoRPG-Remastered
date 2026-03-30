import { Condition } from '../conditions/conditions.js';
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
			condition?: Condition;
	  }
	| {
			id: number;
			price: number;
			type: ItemShopType.ITEM;
			quantity?: number;
			itemType?: ItemType;
			condition?: Condition;
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
