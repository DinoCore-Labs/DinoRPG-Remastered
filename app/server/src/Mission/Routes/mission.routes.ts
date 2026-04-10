import type { FastifyInstance } from 'fastify';

import { getDinozMissionGroupHandler } from '../Service/getDinozMissionGroup.service.js';
import { startDinozMissionHandler } from '../Service/startDinozMission.service.js';

export async function missionsRoutes(app: FastifyInstance) {
	app.get(
		'/dinoz/:id/groups/:group',
		{
			preHandler: [app.authenticate]
		},
		getDinozMissionGroupHandler
	);
	app.post(
		'/dinoz/:id/mission/:missionKey/start',
		{
			preHandler: [app.authenticate]
		},
		startDinozMissionHandler
	);
}
