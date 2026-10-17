import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ItemShopType } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';

import { BotDinozRole, MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { getItemMaxQuantity } from '../../Inventory/Service/getAllItemsData.service.js';
import { getUserShopItemsDataRequest } from '../../Shop/Controller/getUserShopItemsData.controller.js';
import { purchaseItemWithGold } from '../../Shop/Controller/purchaseItemWithGold.controller.js';
import { getBotStrategicGoldReserve } from './botEconomy.service.js';

const BOT_ITEM_GOLD_RESERVE = 1200;

type BotShopPurchase = {
	itemId: number;
	quantity: number;
	unitPrice: number;
	maxQuantity: number;
};

export type BotShopRoleCounts = {
	fighter: number;
	gatherer: number;
	explorer: number;
};

export function getBotShopTargetQuantity(itemId: number, roles: BotShopRoleCounts): number {
	if (itemId === itemList[Item.POTION_IRMA].itemId) {
		return Math.min(20, 5 + roles.fighter * 2 + roles.explorer);
	}
	if (itemId === itemList[Item.POTION_ANGEL].itemId) {
		return Math.min(6, 2 + Math.ceil((roles.gatherer + roles.explorer) / 2));
	}
	if (itemId === itemList[Item.CLOUD_BURGER].itemId) {
		return Math.min(10, 3 + roles.gatherer + roles.explorer * 2);
	}
	if (itemId === itemList[Item.MEAT_PIE].itemId) {
		return Math.min(6, 1 + roles.fighter + roles.explorer);
	}
	if (itemId === itemList[Item.HOT_BREAD].itemId) {
		return roles.gatherer + roles.explorer >= 2 ? 1 : 0;
	}
	if (itemId === itemList[Item.FIGHT_RATION].itemId) {
		return Math.min(8, roles.fighter * 2);
	}
	return 0;
}

export async function getBotShopRoleCounts(userId: string): Promise<BotShopRoleCounts> {
	const memories = await prisma.botDinozMemory.findMany({
		where: {
			dinoz: {
				userId
			},
			role: {
				not: null
			}
		},
		select: {
			role: true
		}
	});

	return {
		fighter: memories.filter(memory => memory.role === BotDinozRole.FIGHTER).length,
		gatherer: memories.filter(memory => memory.role === BotDinozRole.GATHERER).length,
		explorer: memories.filter(memory => memory.role === BotDinozRole.EXPLORER).length
	};
}

export async function getBotShopPurchase(userId: string, shopId: number): Promise<BotShopPurchase | null> {
	const shop = Object.values(shopListV2).find(entry => entry.shopId === shopId);
	if (!shop || shop.type === ShopType.MAGICAL || shop.type === ShopType.FILOU || shop.type === ShopType.ITINERANT) {
		return null;
	}

	const user = await getUserShopItemsDataRequest(userId);
	if (!user) return null;

	const gold = user.wallets.find(wallet => wallet.type === MoneyType.GOLD)?.amount ?? 0;
	const [roles, strategicReserve] = await Promise.all([
		getBotShopRoleCounts(userId),
		getBotStrategicGoldReserve(userId)
	]);
	const goldReserve = Math.max(BOT_ITEM_GOLD_RESERVE, strategicReserve);
	const candidates: BotShopPurchase[] = [];

	for (const sold of shop.listItemsSold) {
		if (sold.type !== ItemShopType.ITEM) continue;

		const targetQuantity = getBotShopTargetQuantity(sold.id, roles);
		if (targetQuantity <= 0) continue;

		const currentQuantity = user.items.find(item => item.itemId === sold.id)?.quantity ?? 0;
		if (currentQuantity >= targetQuantity) continue;

		const item = Object.values(itemList).find(entry => entry.itemId === sold.id);
		if (!item) continue;

		const unitPrice =
			user.merchant && shop.shopId === shopListV2.FLYING_SHOP.shopId ? Math.round(sold.price * 0.9) : sold.price;

		if (gold - unitPrice < goldReserve) continue;

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
	const sold = shop.listItemsSold.find(entry => entry.id === itemList[Item.POTION_IRMA].itemId);
	if (!sold || sold.type !== ItemShopType.ITEM) return false;

	const user = await getUserShopItemsDataRequest(userId);
	if (!user) return false;

	const gold = user.wallets.find(wallet => wallet.type === MoneyType.GOLD)?.amount ?? 0;
	const item = itemList[Item.POTION_IRMA];
	const unitPrice = user.merchant ? Math.round(sold.price * 0.9) : sold.price;

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
