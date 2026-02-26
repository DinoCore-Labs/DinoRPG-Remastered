import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserInventoryDataRequest } from '../Controller/getUserInventory.controller.js';

export const getItemMaxQuantity = (
	userInventory: NonNullable<Awaited<ReturnType<typeof getUserInventoryDataRequest>>>,
	item: ItemFiche
) => {
	if (
		item.itemId === Item.GOBLIN_MERGUEZ /*&&
		playerInventoryData.rewards.some(r => r.rewardId === Reward.MERGUEZ_CARD)*/
	) {
		return userInventory.shopKeeper ? 150 : 100;
	}

	if (userInventory.shopKeeper && item.itemType !== ItemType.MAGICAL) {
		return Math.round(item.maxQuantity * 1.5);
	}

	return item.maxQuantity;
};

export async function getAllItemsData(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	if (!userId) return reply.status(401).send({ error: 'Unauthorized' });

	try {
		const userInventoryData = await getUserInventoryDataRequest(userId);
		if (!userInventoryData) {
			return reply.status(404).send({ error: 'No inventory data found for user' });
		}

		const itemsById = new Map(Object.values(itemList).map(item => [item.itemId, item]));

		const dto = userInventoryData.items.map(i => {
			const item = itemsById.get(i.itemId);
			if (!item) {
				throw new ExpectedError(`Item ${i.itemId} does not exist`);
			}
			return {
				id: item.itemId,
				price: item.price,
				quantity: i.quantity,
				maxQuantity: getItemMaxQuantity(userInventoryData, item)
			};
		});
		return reply.status(200).send(dto);
	} catch (err) {
		if (err instanceof ExpectedError) {
			return reply.status(400).send({ error: err.message });
		}
		req.log.error({ err }, 'Failed to retrieve items data');
		return reply.status(500).send({ error: 'Failed to retrieve items data' });
	}
}
