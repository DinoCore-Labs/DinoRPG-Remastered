import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ShopFiche } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopList } from '@dinorpg/core/models/shop/shopList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { checkDinozPlace } from '../../Dinoz/Service/checkDinozPlace.service.js';
import { decreaseIngredientQuantity } from '../../Inventory/Controller/addIngredient.controller.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { addTreasureTicket, removeMoney } from '../../User/Controller/money.controller.js';
import { getUserShopOneItemDataRequest } from '../Controller/getUserShopOneItemData.controller.js';
import { buyMagicItem } from './buyMagicItem.service.js';

type BuyItemParams = {
	shopId: string;
};

type BuyItemBody = {
	itemId: number;
	quantity: number;
};

export async function buyItemHandler(
	req: FastifyRequest<{ Params: BuyItemParams; Body: BuyItemBody }>,
	reply: FastifyReply
) {
	const userId = req.user?.id;
	if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

	const shopId = Number(req.params.shopId);
	const itemId = Number(req.body?.itemId);
	const quantityBought = Number(req.body?.quantity);

	if (!Number.isFinite(shopId) || !Number.isFinite(itemId) || !Number.isFinite(quantityBought)) {
		return reply.status(400).send({ error: 'Invalid payload' });
	}

	try {
		// Données joueur + item (money, shopKeeper, placeId, items, golden napodinos, etc.)
		const playerShopData = await getUserShopOneItemDataRequest(userId, itemId);
		if (!playerShopData) throw new ExpectedError(`Player ${userId} doesn't exist.`);

		const playerItemData = playerShopData.items.find(i => i.itemId === itemId);

		if (quantityBought <= 0) {
			// throw new ExpectedError(translate('wrongQuantity', req.user));
			throw new ExpectedError('Wrong quantity');
		}

		const theShop: ShopFiche | undefined = Object.values(shopList).find(s => s.shopId === shopId);
		if (!theShop) throw new ExpectedError(`The shop ${shopId} does not exist`);

		checkDinozPlace(theShop, playerShopData, shopId);

		const itemSold = theShop.listItemsSold.find(i => i.id === itemId);
		if (!itemSold) throw new ExpectedError(`The item ${itemId} does not exist in the shop ${shopId}`);

		// Récup item référence
		const itemReference = structuredClone(Object.values(itemList).find(i => i.itemId === itemId));
		if (!itemReference) throw new ExpectedError(`Item ${itemId} doesn't exist.`);

		// Prix shop (merchant -10% au flying shop)
		itemReference.price =
			playerShopData.merchant && theShop.shopId === shopList.FLYING_SHOP.shopId
				? Math.round(itemSold.price * 0.9)
				: itemSold.price;

		itemReference.quantity = playerItemData ? playerItemData.quantity : 0;

		// ShopKeeper : +50% hors MAGICAL
		itemReference.maxQuantity =
			playerShopData.shopKeeper && itemReference.itemType !== ItemType.MAGICAL
				? Math.floor(itemReference.maxQuantity * 1.5)
				: itemReference.maxQuantity;

		// Cas boutique magique
		if (theShop.type === ShopType.MAGICAL) {
			await buyMagicItem({
				userId,
				playerItems: playerShopData.items,
				itemReference,
				quantityBought,
				currentQuantity: itemReference.quantity
			});
		}
		// Cas filou => coupons
		else if (theShop.type === ShopType.FILOU) {
			const ticketWallet = playerShopData.wallets.find(w => w.type === 'TREASURE_TICKET');
			const before = ticketWallet?.amount ?? 0;
			const after = before + quantityBought;

			await addTreasureTicket(userId, quantityBought);

			await incrementUserStat(StatTracking.S_BUYER, userId, quantityBought);

			const itemFromShop = shopList.FILOU.listItemsSold.find(i => i.id === itemId);
			if (!itemFromShop) throw new ExpectedError(`The item ${itemId} is not sellable for coupons!`);

			await decreaseIngredientQuantity(userId, itemReference.itemId, itemFromShop.price * quantityBought);

			return reply.status(200).send({
				wallet: 'TREASURE_TICKET',
				quantity: quantityBought,
				total: after
			});
		}
		// Cas shop normal
		else {
			// Gold check
			const goldWallet = playerShopData.wallets.find(w => w.type === 'GOLD');
			const currentGold = goldWallet?.amount ?? 0;

			if (currentGold < itemReference.price * quantityBought) {
				throw new ExpectedError('Not enough money');
			}

			// Storage check
			if (itemReference.quantity + quantityBought > itemReference.maxQuantity) {
				// throw new ExpectedError(translate('notEnoughStorage', req.user));
				throw new ExpectedError('Not enough storage');
			}

			await removeMoney(userId, itemReference.price * quantityBought);
		}

		// Ajout item (commun normal/magique)
		await addItemToInventory(userId, itemReference.itemId, quantityBought);

		await incrementUserStat(StatTracking.S_BUYER, userId, quantityBought);

		return reply.status(200).send({
			itemId: itemReference.itemId,
			quantity: quantityBought,
			gold: theShop.type === ShopType.MAGICAL ? undefined : itemReference.price * quantityBought
		});
	} catch (err) {
		if (err instanceof ExpectedError) {
			return reply.status(400).send({ error: err.message });
		}
		req.log.error({ err }, 'buyItem failed');
		return reply.status(500).send({ error: 'Failed to buy item' });
	}
}
