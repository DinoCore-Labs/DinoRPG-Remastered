import { type ActiveGameEvent, GameTheme } from '@dinorpg/core/models/game/gameEvents.js';
import { defineStore } from 'pinia';

import { ConfigService } from '../services/config.service';

export const gameConfigStore = defineStore('gameConfig', {
	state: () => ({
		theme: GameTheme.DEFAULT,
		activeEvents: [] as ActiveGameEvent[],
		isEventLockActive: false
	}),
	actions: {
		async load(): Promise<void> {
			try {
				const config = await ConfigService.get();
				this.theme = config.appearance.theme;
				this.activeEvents = config.activeEvents;
				this.isEventLockActive = config.isEventLockActive;
			} catch {
				this.theme = GameTheme.DEFAULT;
				this.activeEvents = [];
				this.isEventLockActive = false;
			}
		}
	}
});
