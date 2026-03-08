import { FastifyInstance } from 'fastify';

import { equipItemParamsSchema, useItemParamsSchema } from '../Schema/inventory.schema.js';
import { equipItem } from '../Service/equipItem.service.js';
import { getAllIngredientsData } from '../Service/getAllIngredientsData.service.js';
import { getAllItemsData } from '../Service/getAllItemsData.service.js';
import { useItemHandler } from '../Service/useItem.service.js';

export async function inventoryRoutes(app: FastifyInstance) {
	app.get('/all/items', {
		preHandler: [app.authenticate],
		schema: {
			tags: ['Inventory']
		},
		handler: getAllItemsData
	});
	app.get('/all/ingredients', {
		preHandler: [app.authenticate],
		schema: {
			tags: ['Inventory']
		},
		handler: getAllIngredientsData
	});
	app.get(
		'/:dinozId/:itemId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Inventory'],
				params: useItemParamsSchema
			}
		},
		useItemHandler
	);
	app.put(
		'/equip/:dinozId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Inventory'],
				params: equipItemParamsSchema
			}
		},
		equipItem
	);
}
