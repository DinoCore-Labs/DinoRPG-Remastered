import { Language } from '@dinorpg/core/models/config/language.js';
import type { StateLocalStore } from '@dinorpg/core/models/store/stateLocalStore.js';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StateLocalStore => ({
		langue: undefined,
		skipLevelAnimation: false,
		skipFightAnimation: true,
		autoReequipItems: false,
		bypassGatheringGrid: false
	}),
	getters: {
		getLanguage: (state: StateLocalStore) => state.langue,
		getSkipLevelAnimation: (state: StateLocalStore) => state.skipLevelAnimation,
		getSkipFightAnimation: (state: StateLocalStore) => state.skipFightAnimation,
		getAutoReequipItems: (state: StateLocalStore) => state.autoReequipItems,
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
		setAutoReequipItems(autoReequipItems: boolean): void {
			this.autoReequipItems = autoReequipItems;
		},
		setBypassGatheringGrid(bypassGatheringGrid: boolean): void {
			this.bypassGatheringGrid = bypassGatheringGrid;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
