import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { removeItem } from '../../Inventory/Controller/removeItem.controller.js';

type BuyMagicItemParams = {
	userId: string;
	playerItems: { itemId: number; quantity: number }[];
	itemReference: ItemFiche;
	quantityBought: number;
	currentQuantity: number; // quantity déjà possédée
};

export async function buyMagicItem({
	userId,
	playerItems,
	itemReference,
	quantityBought,
	currentQuantity
}: BuyMagicItemParams) {
	// quantité possédée de golden napodinos
	const napoItemId = itemList[Item.GOLDEN_NAPODINO].itemId;

	const playerNapoData = playerItems.find(i => i.itemId === napoItemId);
	const napoOwned = playerNapoData?.quantity ?? 0;

	const totalCost = itemReference.price * quantityBought;
	const newQuantity = currentQuantity + quantityBought;

	// 💰 check napodinos
	if (napoOwned < totalCost) {
		throw new ExpectedError('Not enough golden napodinos');
	}

	// 📦 check stockage
	if (newQuantity > itemReference.maxQuantity) {
		throw new ExpectedError('Not enough storage');
	}

	// 💸 paiement
	await removeItem(userId, napoItemId, totalCost);
}
