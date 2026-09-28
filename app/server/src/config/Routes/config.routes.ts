import { PublicGameConfig } from '@dinorpg/core/models/game/publicGameConfig.js';
import type { FastifyInstance } from 'fastify';

import {
	getActiveGameEvents,
	getCurrentGameTheme,
	isEventEndingInDays
} from '../../GameEvent/Service/gameEvent.service.js';

export async function configRoutes(app: FastifyInstance) {
	app.get('/config', async (): Promise<PublicGameConfig> => {
		return {
			appearance: {
				theme: getCurrentGameTheme()
			},
			activeEvents: getActiveGameEvents(),
			isEventLockActive: isEventEndingInDays(10)
		};
	});
}
