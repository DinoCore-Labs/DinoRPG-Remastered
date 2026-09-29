import type { FastifyInstance } from 'fastify';

import { botIdParamsSchema, createBotBodySchema, updateBotBodySchema } from '../Schema/bot.schema.js';
import { createBotHandler, listBotsHandler, updateBotHandler } from '../Service/adminBot.service.js';

export async function botRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin']
			}
		},
		listBotsHandler
	);

	app.post(
		'/',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin'],
				body: createBotBodySchema
			}
		},
		createBotHandler
	);

	app.patch(
		'/:id',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin'],
				params: botIdParamsSchema,
				body: updateBotBodySchema
			}
		},
		updateBotHandler
	);
}
