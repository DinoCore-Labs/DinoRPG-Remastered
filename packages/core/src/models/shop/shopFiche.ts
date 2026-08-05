/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/core/src/models/shop/ShopFiche.mts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-28 through 2026-07-31.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
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
			maxQuantity?: number;
			condition?: Condition;
	  }
	| {
			id: number;
			price: number;
			type: ItemShopType.ITEM;
			quantity?: number;
			maxQuantity?: number;
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
