import type { StateSessionStore } from '@dinorpg/core/models/store/stateSessionStore.js';
import { defineStore } from 'pinia';
//import { FightResult } from '@drpg/core/models/fight/FightResult';
//import { LiveStatsType } from '@drpg/core/models/store/LiveStats';

export const sessionStore = defineStore('sessionStore', {
	state: (): StateSessionStore => ({
		//fight: undefined,
		tab: 1
		//fromFight: false,
		/*liveStats: {
			connectedPlayers: 0,
			totalDinoz: 0,
			totalPlayers: 0
		}*/
	}),
	getters: {
		//getFightResult: (state: StateSessionStore) => state.fight,
		getTab: (state: StateSessionStore) => state.tab
		//getLiveStats: (state: StateSessionStore) => state.liveStats
	},
	actions: {
		/*setFightResult(fight: FightResult | undefined): void {
			this.fight = fight;
		},*/
		setTab(tab: number): void {
			this.tab = tab;
		} /*,
		setLiveStats(stats: LiveStatsType): void {
			this.liveStats = stats;
		}*/
	},
	persist: {
		storage: window.sessionStorage
	}
});
