import type { FastifyInstance } from 'fastify';

import { getDinozMissionDetailHandler } from '../Service/getDinozMissionDetail.service.js';
import { getDinozMissionGroupHandler } from '../Service/getDinozMissionGroup.service.js';
import {
	completeMissionInteractionController,
	startMissionInteractionController
} from '../Service/missionInteract.service.js';
import { startDinozMissionHandler } from '../Service/startDinozMission.service.js';
import { stopDinozMissionHandler } from '../Service/stopDinozMission.service.js';

export async function missionsRoutes(app: FastifyInstance) {
	app.get(
		'/dinoz/:id/groups/:group',
		{
			preHandler: [app.authenticate]
		},
		getDinozMissionGroupHandler
	);
	app.get(
		'/dinoz/:id/mission/:missionKey',
		{
			preHandler: [app.authenticate]
		},
		getDinozMissionDetailHandler
	);
	app.post(
		'/dinoz/:id/mission/:missionKey/start',
		{
			preHandler: [app.authenticate]
		},
		startDinozMissionHandler
	);
	app.post(
		'/dinoz/:id/mission/:missionKey/stop',
		{
			preHandler: [app.authenticate]
		},
		stopDinozMissionHandler
	);
	app.post(
		'/dinoz/:id/mission/action/start',
		{
			preHandler: [app.authenticate]
		},
		startMissionInteractionController
	);
	app.post(
		'/dinoz/:id/mission/action/complete',
		{
			preHandler: [app.authenticate]
		},
		completeMissionInteractionController
	);
}
