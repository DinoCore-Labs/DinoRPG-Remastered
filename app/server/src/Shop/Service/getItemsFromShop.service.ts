import { ItemShopFiche, ItemShopType } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopList } from '@dinorpg/core/models/shop/shopList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { checkDinozPlace } from '../../Dinoz/Service/checkDinozPlace.service.js';
import { getUserShopItemsDataRequest } from '../Controller/getUserShopItemsData.controller.js';

type GetItemsFromShopParams = {
	shopId: string; // route param => string
};

export async function getItemsFromShopHandler(
	req: FastifyRequest<{ Params: GetItemsFromShopParams }>,
	reply: FastifyReply
) {
	const userId = req.user?.id;
	if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

	const shopId = Number(req.params.shopId);
	if (!Number.isFinite(shopId)) {
		return reply.status(400).send({ error: 'Invalid shopId' });
	}

	try {
		const tempShop = Object.values(shopList).find(shop => shop.shopId === shopId);

		// Throw an exception if the shop does not exist
		if (!tempShop) {
			throw new ExpectedError(`The shop ${shopId} does not exist`);
		}

		// Get the player's data (money, shopKeeper, list of dinoz not frozen or sacrificed (placeId), list of items (quantity))
		const playerShopData = await getUserShopItemsDataRequest(userId);

		if (!playerShopData) {
			throw new ExpectedError(`Player ${userId} doesn't exist.`);
		}

		checkDinozPlace(tempShop, playerShopData, shopId);

		// All checks passed, let's create the list of items with the proper values
		const dto: ItemShopFiche[] = tempShop.listItemsSold.map(itemSold => {
			const itemPlayer =
				itemSold.type === ItemShopType.ITEM
					? playerShopData.items.find(playerItem => playerItem.itemId === itemSold.id)
					: playerShopData.ingredients.find(playerItem => playerItem.ingredientId === itemSold.id);

			return {
				id: itemSold.id,
				price:
					playerShopData.merchant && tempShop.shopId === shopList.FLYING_SHOP.shopId
						? Math.round(itemSold.price * 0.9)
						: itemSold.price,
				quantity: itemPlayer ? itemPlayer.quantity : 0,
				type: itemSold.type
			};
		});

		return reply.status(200).send(dto);
	} catch (err) {
		if (err instanceof ExpectedError) {
			return reply.status(400).send({ error: err.message });
		}
		req.log.error({ err }, 'getItemsFromShop failed');
		return reply.status(500).send({ error: 'Failed to retrieve shop items' });
	}
}
