import type { FastifyInstance } from 'fastify';

import { processFightResponseSchema, processFightSchema } from '../Schema/fight.schema.js';
import { processDialogFightBodySchema } from '../Schema/fightDialog.schema.js';
import { processFight } from '../Service/fight.service.js';
import { processDialogFight } from '../Service/processDialogFight.service.js';

export async function fightRoutes(app: FastifyInstance) {
	app.put(
		'/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Fight'],
				body: processFightSchema,
				response: {
					200: processFightResponseSchema
				}
			}
		},
		processFight
	);
	app.put(
		'/dialog',
		{
			preHandler: [app.authenticate],
			schema: {
				body: processDialogFightBodySchema,
				tags: ['Fight']
			}
		},
		processDialogFight
	);
}
