import { FastifyInstance } from 'fastify';

import { getAllItemsData } from '../Controller/getAllItemsData.controller.js';

export async function inventoryRoutes(app: FastifyInstance) {
	app.get('/all', { preHandler: [app.authenticate], handler: getAllItemsData });
}
