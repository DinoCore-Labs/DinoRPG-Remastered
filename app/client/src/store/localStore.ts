import { Language } from '@dinorpg/core/models/config/language.js';
import type { StateLocalStore } from '@dinorpg/core/models/store/stateLocalStore.js';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StateLocalStore => ({
		langue: undefined,
		skipLevelAnimation: false,
		skipFightAnimation: true,
		bypassGatheringGrid: false
	}),
	getters: {
		getLanguage: (state: StateLocalStore) => state.langue,
		getSkipLevelAnimation: (state: StateLocalStore) => state.skipLevelAnimation,
		getSkipFightAnimation: (state: StateLocalStore) => state.skipFightAnimation,
		getBypassGatheringGrid: (state: StateLocalStore) => state.bypassGatheringGrid
	},
	actions: {
		setLanguage(langue: Language): void {
			this.langue = langue;
		},
		setSkipLevelAnimation(skipLevelAnimation: boolean): void {
			this.skipLevelAnimation = skipLevelAnimation;
		},
		setSkipFightAnimation(skipFightAnimation: boolean): void {
			this.skipFightAnimation = skipFightAnimation;
		},
		setBypassGatheringGrid(bypassGatheringGrid: boolean): void {
			this.bypassGatheringGrid = bypassGatheringGrid;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
