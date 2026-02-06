import { FastifyInstance } from 'fastify';

import { equipItem } from '../Service/equipItem.service.js';
import { getAllIngredientsData } from '../Service/getAllIngredientsData.service.js';
import { getAllItemsData } from '../Service/getAllItemsData.service.js';

export async function inventoryRoutes(app: FastifyInstance) {
	app.get('/all/items', { preHandler: [app.authenticate], handler: getAllItemsData });
	app.get('/all/ingredients', { preHandler: [app.authenticate], handler: getAllIngredientsData });
	app.put('/equip/:dinozId', { preHandler: app.authenticate }, equipItem);
}
