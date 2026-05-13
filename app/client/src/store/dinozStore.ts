import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { DinozStore } from '@dinorpg/core/models/store/dinozStore.js';
import type { AxiosRequestConfig } from 'axios';
import { defineStore } from 'pinia';

import { DinozService } from '../services/dinoz.service.js';

export const dinozStore = defineStore('dinozStore', {
	state: (): DinozStore => ({
		dinozList: [],
		currentDinozId: undefined,
		isHydrated: false
	}),
	getters: {
		getDinozList: (state: DinozStore) => state.dinozList,
		getDinoz: (state: DinozStore) => {
			return (dinozId: number) => state.dinozList?.find((dinoz: DinozFiche) => dinoz.id === dinozId);
		},
		getCurrentDinozId: (state: DinozStore) => state.currentDinozId
	},
	actions: {
		setDinoz(dinoz: DinozFiche): void {
			const index = this.dinozList.findIndex(current => current.id === dinoz.id);
			if (index === -1) {
				this.dinozList = [...this.dinozList, dinoz];
				return;
			}
			this.dinozList = this.dinozList.map(current => (current.id === dinoz.id ? dinoz : current));
		},
		setDinozList(dinozList: DinozFiche[]): void {
			this.dinozList = [...dinozList];
		},
		async refreshDinozMenu(config?: AxiosRequestConfig): Promise<void> {
			const dinozList = await DinozService.getDinozMenu(config);
			this.setDinozList(dinozList);
		},
		setCurrentDinozId(dinozId: number): void {
			this.currentDinozId = dinozId;
		},
		clearDinoz() {
			this.dinozList = [];
			this.currentDinozId = undefined;
			this.isHydrated = false;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
