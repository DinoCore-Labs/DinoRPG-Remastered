import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ShopFiche } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { checkDinozPlace } from '../../Dinoz/Service/checkDinozPlace.service.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { getItemMaxQuantity } from '../../Inventory/Service/getAllItemsData.service.js';
import { incrementUserStat } from '../../Stats/stats.service.js';
import { refreshTutorialProgress } from '../../Tutorial/Controller/tutorial.controller.js';
import { exchangeFilouIngredients } from '../Controller/exchangeFilou.controller.js';
import { getUserShopOneItemDataRequest } from '../Controller/getUserShopOneItemData.controller.js';
import { purchaseItemWithGold } from '../Controller/purchaseItemWithGold.controller.js';
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
		const tutorialDinozId = playerShopData.dinoz[0]?.id;
		const playerItemData = playerShopData.items.find(i => i.itemId === itemId);
		if (quantityBought <= 0) {
			throw new ExpectedError('Wrong quantity');
		}
		const theShop: ShopFiche | undefined = Object.values(shopListV2).find(s => s.shopId === shopId);
		if (!theShop) throw new ExpectedError(`The shop ${shopId} does not exist`);
		checkDinozPlace(theShop, playerShopData, shopId);
		const itemSold = theShop.listItemsSold.find(i => i.id === itemId);
		if (!itemSold) throw new ExpectedError(`The item ${itemId} does not exist in the shop ${shopId}`);
		// Cas Filou => ingrédients contre tickets trésor
		if (theShop.type === ShopType.FILOU) {
			const ingredientId = itemSold.id;
			const ingredientQuantityUsed = itemSold.price * quantityBought;
			const exchange = await exchangeFilouIngredients({
				userId,
				ingredientId,
				ingredientQuantity: ingredientQuantityUsed,
				ticketQuantity: quantityBought
			});
			await incrementUserStat(StatTracking.S_BUYER, userId, quantityBought);
			if (tutorialDinozId !== undefined) {
				await refreshTutorialProgress({
					userId,
					dinozId: tutorialDinozId
				});
			}
			safeCreateGameLog(
				{
					type: GameLogType.IngredientSold,
					userId,
					values: [String(exchange.ingredientQuantityUsed), String(ingredientId), String(exchange.ticketQuantity)],
					metadata: {
						ingredientId,
						ingredientQuantity: exchange.ingredientQuantityUsed,
						shopId: theShop.shopId,
						shopType: theShop.type,
						reason: 'FILOU_SHOP_EXCHANGE',
						wallet: 'TREASURE_TICKET',
						treasureTicketQuantity: exchange.ticketQuantity,
						treasureTicketBefore: exchange.ticketBefore,
						treasureTicketAfter: exchange.ticketAfter,
						unitPrice: itemSold.price,
						totalPrice: exchange.ingredientQuantityUsed
					}
				},
				req.log
			);
			return reply.status(200).send({
				wallet: 'TREASURE_TICKET',
				quantity: exchange.ticketQuantity,
				total: exchange.ticketAfter
			});
		}
		// Récup item référence
		const itemReference = structuredClone(Object.values(itemList).find(i => i.itemId === itemId));
		if (!itemReference) {
			throw new ExpectedError('itemNotFound');
		}
		// Prix shop (merchant -10% au flying shop)
		itemReference.price =
			playerShopData.merchant && theShop.shopId === shopListV2.FLYING_SHOP.shopId
				? Math.round(itemSold.price * 0.9)
				: itemSold.price;
		itemReference.quantity = playerItemData ? playerItemData.quantity : 0;
		// ShopKeeper : +50% hors MAGICAL
		itemReference.maxQuantity = getItemMaxQuantity(playerShopData, itemReference);
		// Cas boutique magique
		if (theShop.type === ShopType.MAGICAL) {
			await buyMagicItem({
				userId,
				playerItems: playerShopData.items,
				itemReference,
				quantityBought,
				currentQuantity: itemReference.quantity,
				log: req.log
			});
			await addItemToInventory(userId, itemReference.itemId, quantityBought);
			// Cas shop classique
		} else {
			await purchaseItemWithGold({
				userId,
				itemId: itemReference.itemId,
				quantity: quantityBought,
				unitPrice: itemReference.price,
				maxQuantity: itemReference.maxQuantity
			});
		}
		await incrementUserStat(StatTracking.S_BUYER, userId, quantityBought);
		if (tutorialDinozId !== undefined) {
			await refreshTutorialProgress({
				userId,
				dinozId: tutorialDinozId
			});
		}
		const totalPrice = itemReference.price * quantityBought;
		const isMagicShop = theShop.type === ShopType.MAGICAL;
		safeCreateGameLog(
			{
				type: GameLogType.ItemBought,
				userId,
				values: [String(quantityBought), String(itemReference.itemId), String(totalPrice)],
				metadata: {
					itemId: itemReference.itemId,
					quantity: quantityBought,
					shopId: theShop.shopId,
					shopType: theShop.type,
					unitPrice: itemReference.price,
					totalPrice,
					currency: isMagicShop ? 'GOLDEN_NAPODINO' : 'GOLD',
					paymentItemId: isMagicShop ? itemList[Item.GOLDEN_NAPODINO].itemId : null
				}
			},
			req.log
		);
		return reply.status(200).send({
			itemId: itemReference.itemId,
			quantity: quantityBought,
			gold: theShop.type === ShopType.MAGICAL ? undefined : totalPrice
		});
	} catch (err) {
		if (err instanceof ExpectedError) {
			return reply.status(400).send({ error: err.message });
		}
		req.log.error({ err }, 'buyItem failed');
		return reply.status(500).send({ error: 'Failed to buy item' });
	}
}
