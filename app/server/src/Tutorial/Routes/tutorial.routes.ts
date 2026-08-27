import type { FastifyInstance } from 'fastify';

import { tutorialEventBodySchema } from '../Schema/tutorial.schema.js';
import { getCurrentTutorialController, sendTutorialEventController } from '../Service/tutorial.service.js';

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
				body: tutorialEventBodySchema
			}
		},
		sendTutorialEventController
	);
}
