import type { FastifyInstance } from 'fastify';

import { roadmapLanguageQuerySchema } from '../Schema/roadmap.schema.js';
import { getRoadmapHandler } from '../Service/roadmapHandler.service.js';

export async function roadmapRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: [app.noAuth],
			schema: {
				tags: ['Roadmap'],
				querystring: roadmapLanguageQuerySchema
			}
		},
		getRoadmapHandler
	);
}
