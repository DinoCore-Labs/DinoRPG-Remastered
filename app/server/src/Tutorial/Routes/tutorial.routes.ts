import type { FastifyInstance } from 'fastify';

import {
	getCurrentTutorialController,
	sendTutorialEventController,
	tutorialClientEvents
} from '../Service/tutorial.service.js';

export async function tutorialRoutes(app: FastifyInstance) {
	app.get(
		'/current',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Tutorial']
			}
		},
		getCurrentTutorialController
	);
	app.post(
		'/event',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Tutorial'],
				body: {
					type: 'object',
					additionalProperties: false,
					required: ['event'],
					properties: {
						event: {
							type: 'string',
							enum: [...tutorialClientEvents]
						}
					}
				}
			}
		},
		sendTutorialEventController
	);
}
