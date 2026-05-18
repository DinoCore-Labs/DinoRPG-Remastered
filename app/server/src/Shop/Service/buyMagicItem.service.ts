import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyBaseLogger } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { removeItem } from '../../Inventory/Controller/removeItem.controller.js';

type BuyMagicItemParams = {
	userId: string;
	playerItems: { itemId: number; quantity: number }[];
	itemReference: ItemFiche;
	quantityBought: number;
	currentQuantity: number; // quantity déjà possédée
	log?: FastifyBaseLogger;
};

export async function buyMagicItem({
	userId,
	playerItems,
	itemReference,
	quantityBought,
	currentQuantity,
	log
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

	if (log) {
		void safeCreateGameLog(
			{
				type: GameLogType.ItemUsed,
				userId,
				values: [String(napoItemId), String(totalCost)],
				metadata: {
					itemId: napoItemId,
					quantity: totalCost,
					reason: 'MAGICAL_SHOP_PAYMENT',
					boughtItemId: itemReference.itemId,
					boughtQuantity: quantityBought,
					unitPrice: itemReference.price,
					totalCost
				}
			},
			log
		);
	}
}
