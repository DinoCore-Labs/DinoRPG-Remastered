import { Language } from '@dinorpg/core/models/config/language.js';
import type { StateLocalStore } from '@dinorpg/core/models/store/stateLocalStore.js';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StateLocalStore => ({
		langue: undefined,
		skipLevelAnimation: false,
		skipFightAnimation: true
	}),
	getters: {
		getLanguage: (state: StateLocalStore) => state.langue,
		getSkipLevelAnimation: (state: StateLocalStore) => state.skipLevelAnimation,
		getSkipFightAnimation: (state: StateLocalStore) => state.skipFightAnimation
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
		}
	},
	persist: {
		storage: window.localStorage
	}
});
