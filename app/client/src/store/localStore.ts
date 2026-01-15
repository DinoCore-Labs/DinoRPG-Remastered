import { Language } from '@dinorpg/core/models/config/language.js';
import type { StateLocalStore } from '@dinorpg/core/models/store/stateLocalStore.js';
import { defineStore } from 'pinia';

export const localStore = defineStore('localStore', {
	state: (): StateLocalStore => ({
		langue: undefined
	}),
	getters: {
		getLanguage: (state: StateLocalStore) => state.langue
	},
	actions: {
		setLanguage(langue: Language): void {
			this.langue = langue;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
