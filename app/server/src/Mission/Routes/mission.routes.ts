import type { FastifyInstance } from 'fastify';

import { getDinozMissionGroupHandler } from '../Service/getDinozMissionGroup.service.js';

export async function missionsRoutes(app: FastifyInstance) {
	app.get(
		'/dinoz/:id/groups/:group',
		{
			preHandler: [app.authenticate]
		},
		getDinozMissionGroupHandler
	);
}
