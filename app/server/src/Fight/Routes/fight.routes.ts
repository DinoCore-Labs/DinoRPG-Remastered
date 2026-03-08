import type { FastifyInstance } from 'fastify';

import { fightParamSchema, processFightResponseSchema, processFightSchema } from '../Schema/fight.schema.js';
import { processFight } from '../Service/fight.service.js';

export async function fightRoutes(app: FastifyInstance) {
	app.put(
		'/:id',
		{
			preHandler: app.authenticate,
			schema: {
				params: fightParamSchema,
				body: processFightSchema,
				response: {
					200: processFightResponseSchema
				}
			}
		},
		processFight
	);
}
