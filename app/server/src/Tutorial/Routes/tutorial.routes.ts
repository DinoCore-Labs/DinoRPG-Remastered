import type { FastifyInstance } from 'fastify';

import { getCurrentTutorialController } from '../Service/tutorial.service.js';

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
}
