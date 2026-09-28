import { GameTheme } from '@dinorpg/core/models/game/gameEvents.js';
import { defineStore } from 'pinia';

import { ConfigService } from '../services/config.service';

export const gameConfigStore = defineStore('gameConfig', {
	state: () => ({
		theme: GameTheme.DEFAULT
	}),
	actions: {
		async load(): Promise<void> {
			try {
				const config = await ConfigService.get();
				this.theme = config.appearance.theme;
			} catch {
				this.theme = GameTheme.DEFAULT;
			}
		}
	}
});
