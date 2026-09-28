import type { PublicGameConfig } from '@dinorpg/core/models/game/publicGameConfig.js';

import { api } from '../utils/http';

export const ConfigService = {
	get(): Promise<PublicGameConfig> {
		return api.get('/config', {
			silent: true
		});
	}
};
