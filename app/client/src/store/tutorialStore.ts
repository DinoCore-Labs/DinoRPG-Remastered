import { defineStore } from 'pinia';

import { type TutorialResponse, TutorialService } from '../services/tutorial.service';

export const useTutorialStore = defineStore('tutorial', {
	state: () => ({
		tutorial: null as TutorialResponse | null,
		hidden: false
	}),
	getters: {
		currentObjective(state) {
			return state.tutorial?.objective ?? null;
		},
		isVisible(state) {
			return !state.hidden && !state.tutorial?.completed && state.tutorial?.objective?.begin.visible !== false;
		}
	},
	actions: {
		async load() {
			this.tutorial = await TutorialService.getCurrent();
		},
		hide() {
			this.hidden = true;
		},
		show() {
			this.hidden = false;
		}
	}
});
