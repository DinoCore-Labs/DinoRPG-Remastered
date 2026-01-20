import { FastifyInstance } from 'fastify';

import { getAllIngredientsData } from '../Controller/getAllIngredientsData.controller.js';
import { getAllItemsData } from '../Controller/getAllItemsData.controller.js';

export async function inventoryRoutes(app: FastifyInstance) {
	app.get('/all/items', { preHandler: [app.authenticate], handler: getAllItemsData });
	app.get('/all/ingredients', { preHandler: [app.authenticate], handler: getAllIngredientsData });
}
