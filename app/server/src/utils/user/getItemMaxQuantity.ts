//import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';

//import { Item } from '@dinorpg/core/models/items/itemList.js';
//import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { getUserInventoryDataRequest } from '../../Inventory/Controller/getUserInventory.controller.js';

export const getItemMaxQuantity = (
	userInventoryData: NonNullable<Awaited<ReturnType<typeof getUserInventoryDataRequest>>>,
	item: ItemFiche
) => {
	/*if (item.itemId === Item.GOBLIN_MERGUEZ && userInventoryData.rewards.some(r => r.rewardId === Reward.MERGUEZ_CARD)) {
		return userInventoryData.shopKeeper ? 150 : 100;
	}

	if (userInventoryData.shopKeeper && item.itemType !== ItemType.MAGICAL) {
		return Math.round(item.maxQuantity * 1.5);
	}*/

	return item.maxQuantity;
};
