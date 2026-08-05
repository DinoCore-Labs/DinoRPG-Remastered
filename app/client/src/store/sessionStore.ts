/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/store/sessionStore.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-02-09 through 2026-02-09.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';
import type { StateSessionStore } from '@dinorpg/core/models/store/stateSessionStore.js';
import { defineStore } from 'pinia';
//import { LiveStatsType } from '@drpg/core/models/store/LiveStats';

export const sessionStore = defineStore('sessionStore', {
	state: (): StateSessionStore => ({
		fight: undefined,
		fromFight: false,
		tabDinoz: 1,
		tabAccount: 1
		/*liveStats: {
			connectedPlayers: 0,
			totalDinoz: 0,
			totalPlayers: 0
		}*/
	}),
	getters: {
		getFightResult: (state: StateSessionStore) => state.fight,
		getTabDinoz: (state: StateSessionStore) => state.tabDinoz,
		getTabAccount: (state: StateSessionStore) => state.tabAccount
		//getLiveStats: (state: StateSessionStore) => state.liveStats
	},
	actions: {
		setFightResult(fight: FightResult | undefined): void {
			this.fight = fight;
		},
		setTabDinoz(tab: number): void {
			this.tabDinoz = tab;
		},
		setTabAccount(tab: number): void {
			this.tabAccount = tab;
		} /*,
		setLiveStats(stats: LiveStatsType): void {
			this.liveStats = stats;
		}*/
	},
	persist: {
		storage: window.sessionStorage
	}
});
