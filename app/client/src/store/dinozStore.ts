import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { DinozStore } from '@dinorpg/core/models/store/dinozStore.js';
import { defineStore } from 'pinia';

export const dinozStore = defineStore('dinozStore', {
	state: (): DinozStore => ({
		dinozList: [],
		currentDinozId: undefined
	}),
	getters: {
		getDinozList: (state: DinozStore) => state.dinozList,
		getDinoz: (state: DinozStore) => {
			return (dinozId: number) => state.dinozList?.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		},
		getCurrentDinozId: (state: DinozStore) => state.currentDinozId
	},
	actions: {
		setDinozList(dinozList: Array<DinozFiche>): void {
			this.dinozList = dinozList;
		},
		setDinoz(dinoz: DinozFiche): void {
			const dinozToUpdate = this.dinozList.findIndex(dinozs => dinozs.id === dinoz.id);
			this.dinozList.splice(dinozToUpdate, 1, dinoz);
		},
		setCurrentDinozId(dinozId: number): void {
			this.currentDinozId = dinozId;
		},
		clearDinoz() {
			this.dinozList = [];
			this.currentDinozId = undefined;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
