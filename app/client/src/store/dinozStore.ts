import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { DinozStore } from '@dinorpg/core/models/store/dinozStore.js';
import type { AxiosRequestConfig } from 'axios';
import { defineStore } from 'pinia';

import { DinozService } from '../services/dinoz.service.js';

let dinozMenuRefreshPromise: Promise<void> | null = null;
let lastDinozMenuRefreshAt = 0;
const DINOZ_MENU_REFRESH_TTL_MS = 10_000;

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
		async refreshDinozMenu(config?: AxiosRequestConfig, options: { force?: boolean } = {}): Promise<void> {
			const now = Date.now();
			if (!options.force && now - lastDinozMenuRefreshAt < DINOZ_MENU_REFRESH_TTL_MS) {
				return;
			}
			if (dinozMenuRefreshPromise) {
				return dinozMenuRefreshPromise;
			}
			dinozMenuRefreshPromise = DinozService.getDinozMenu(config)
				.then(dinozList => {
					this.setDinozList(dinozList);
					lastDinozMenuRefreshAt = Date.now();
				})
				.finally(() => {
					dinozMenuRefreshPromise = null;
				});
			return dinozMenuRefreshPromise;
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
