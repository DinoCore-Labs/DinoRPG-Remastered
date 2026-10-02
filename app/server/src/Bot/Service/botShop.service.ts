import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ItemShopType } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';

import { MoneyType } from '../../../../prisma/index.js';
import { getItemMaxQuantity } from '../../Inventory/Service/getAllItemsData.service.js';
import { getUserShopItemsDataRequest } from '../../Shop/Controller/getUserShopItemsData.controller.js';
import { purchaseItemWithGold } from '../../Shop/Controller/purchaseItemWithGold.controller.js';

const BOT_ITEM_GOLD_RESERVE = 1200;

type BotShopPurchase = {
	itemId: number;
	quantity: number;
	unitPrice: number;
	maxQuantity: number;
};

function getTargetQuantity(itemId: number): number {
	if (itemId === itemList[Item.POTION_IRMA].itemId) return 5;
	if (itemId === itemList[Item.POTION_ANGEL].itemId) return 2;
	const item = Object.values(itemList).find(entry => entry.itemId === itemId);
	if (item?.effect?.category === ItemEffect.HEAL) return 3;
	return 0;
}

export async function getBotShopPurchase(userId: string, shopId: number): Promise<BotShopPurchase | null> {
	const shop = Object.values(shopListV2).find(entry => entry.shopId === shopId);
	if (!shop || shop.type === ShopType.MAGICAL || shop.type === ShopType.FILOU || shop.type === ShopType.ITINERANT) {
		return null;
	}

	const user = await getUserShopItemsDataRequest(userId);
	if (!user) return null;

	const gold = user.wallets.find(wallet => wallet.type === MoneyType.GOLD)?.amount ?? 0;
	const candidates: BotShopPurchase[] = [];

	for (const sold of shop.listItemsSold) {
		if (sold.type !== ItemShopType.ITEM) continue;

		const targetQuantity = getTargetQuantity(sold.id);
		if (targetQuantity <= 0) continue;

		const currentQuantity = user.items.find(item => item.itemId === sold.id)?.quantity ?? 0;
		if (currentQuantity >= targetQuantity) continue;

		const item = Object.values(itemList).find(entry => entry.itemId === sold.id);
		if (!item) continue;

		const unitPrice =
			user.merchant && shop.shopId === shopListV2.FLYING_SHOP.shopId
				? Math.round(sold.price * 0.9)
				: sold.price;

		if (gold - unitPrice < BOT_ITEM_GOLD_RESERVE) continue;

		candidates.push({
			itemId: sold.id,
			quantity: 1,
			unitPrice,
			maxQuantity: getItemMaxQuantity(user, item)
		});
	}

	if (candidates.length === 0) return null;
	candidates.sort((a, b) => a.unitPrice - b.unitPrice);
	return candidates[0];
}

export async function buyBotUsefulItem(userId: string, shopId: number): Promise<boolean> {
	const purchase = await getBotShopPurchase(userId, shopId);
	if (!purchase) return false;

	await purchaseItemWithGold({
		userId,
		itemId: purchase.itemId,
		quantity: purchase.quantity,
		unitPrice: purchase.unitPrice,
		maxQuantity: purchase.maxQuantity
	});
	return true;
}


export async function buyBotIrma(userId: string): Promise<boolean> {
	const shop = shopListV2.FLYING_SHOP;
	const sold = shop.listItemsSold.find(
		entry => entry.id === itemList[Item.POTION_IRMA].itemId
	);
	if (!sold || sold.type !== ItemShopType.ITEM) return false;

	const user = await getUserShopItemsDataRequest(userId);
	if (!user) return false;

	const gold = user.wallets.find(wallet => wallet.type === MoneyType.GOLD)?.amount ?? 0;
	const item = itemList[Item.POTION_IRMA];
	const unitPrice =
		user.merchant
			? Math.round(sold.price * 0.9)
			: sold.price;

	if (gold < unitPrice) return false;

	await purchaseItemWithGold({
		userId,
		itemId: item.itemId,
		quantity: 1,
		unitPrice,
		maxQuantity: getItemMaxQuantity(user, item)
	});
	return true;
}
