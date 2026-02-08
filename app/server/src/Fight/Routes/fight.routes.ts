import type { FastifyInstance } from 'fastify';

import { $fightRef } from '../Schema/fight.schema.js';
import { processFight } from '../Service/fight.service.js';

export async function fightRoutes(app: FastifyInstance) {
	app.put(
		'/:id',
		{
			preHandler: app.authenticate,
			schema: {
				body: $fightRef('processFightSchema'),
				response: {
					200: $fightRef('processFightResponseSchema')
				}
			}
		},
		processFight
	);
}
