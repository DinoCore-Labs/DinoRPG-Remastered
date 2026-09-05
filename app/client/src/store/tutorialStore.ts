import { defineStore } from 'pinia';

import { type TutorialClientEvent, type TutorialResponse, TutorialService } from '../services/tutorial.service';

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
		async sendEvent(event: TutorialClientEvent) {
			const previousProgression = this.tutorial?.progression ?? null;
			const tutorial = await TutorialService.sendEvent(event);
			this.tutorial = tutorial;
			/*
			 * Si un nouvel objectif vient d'être débloqué,
			 * on réaffiche son bandeau même si le joueur avait
			 * fermé manuellement l'objectif précédent.
			 */
			if (tutorial && tutorial.progression !== previousProgression) {
				this.hidden = false;
			}
			return tutorial;
		},
		hide() {
			this.hidden = true;
		},
		show() {
			this.hidden = false;
		}
	}
});
