import { PublicGameConfig } from '@dinorpg/core/models/game/publicGameConfig.js';
import type { FastifyInstance } from 'fastify';

import { getCurrentGameTheme } from '../../GameEvent/Service/gameEvent.service.js';

export async function configRoutes(app: FastifyInstance) {
	app.get('/config', async (): Promise<PublicGameConfig> => {
		return {
			appearance: {
				theme: getCurrentGameTheme()
			}
		};
	});
}
