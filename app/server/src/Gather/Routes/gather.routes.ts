import { FastifyInstance } from 'fastify';

import { gatherWithDinozHandler } from '../Service/gatherWithDinoz.service.js';
import { getGatherGridHandler } from '../Service/getGatherGrid.service.js';

export async function gatherRoutes(app: FastifyInstance) {
	app.get('/grid/:type/:id', { preHandler: [app.authenticate], handler: getGatherGridHandler });
	app.put('/:id', { preHandler: app.authenticate }, gatherWithDinozHandler);
}
