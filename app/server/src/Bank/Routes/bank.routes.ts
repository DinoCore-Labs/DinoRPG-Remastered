import type { FastifyInstance } from 'fastify';

import { convertTreasureTicketsBodySchema } from '../Schema/bank.schema.js';
import { convertTreasureTicketsController, getBankExchangeRateController } from '../Service/bank.service.js';

export async function bankRoutes(app: FastifyInstance) {
	app.get(
		'/rate',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank']
			}
		},
		getBankExchangeRateController
	);

	app.post(
		'/treasure-tickets/convert',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank'],
				body: convertTreasureTicketsBodySchema
			}
		},
		convertTreasureTicketsController
	);
}
