import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { getUserInventoryDataRequest } from '../Controller/getUserInventory.controller.js';

export async function getAllItemsData(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	if (!userId) {
		return reply.status(400).send({ error: 'User ID is required' });
	}

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
				quantity: i.quantity,
				maxQuantity: item.maxQuantity
			};
		});
		return reply.status(200).send(dto);
	} catch (error) {
		return reply.status(500).send({ error: 'Failed to retrieve items data' });
	}
}
