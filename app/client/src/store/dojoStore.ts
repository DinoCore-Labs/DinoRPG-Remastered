/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-ui/src/store/dojoStore.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-06-13 through 2026-07-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import type { DojoStore } from '@dinorpg/core/models/store/dojoStore.js';
import { defineStore } from 'pinia';

import { DojoService } from '../services/dojo.service.js';

export const dojoStore = defineStore('dojoStore', {
	state: (): DojoStore => ({
		dojoId: undefined,
		activeChallenge: undefined,
		reputation: 0,
		DojoChallengeHistory: undefined,
		TournamentTeam: undefined,
		currentTournament: null,
		rank: 0,
		worth: 0,
		tournamentInfo: undefined,
		myTeam: []
	}),
	getters: {
		getReputation: (state: DojoStore) => state.reputation,
		getWorth: (state: DojoStore) => state.worth,
		getRank: (state: DojoStore) => state.rank,
		getState: (state: DojoStore) => state.currentTournament,
		getTeam: (state: DojoStore) => state.myTeam
		// getDojo: (state: DojoStore) => state.dojo,
		// getTournament: (state: DojoStore) => state.tournament
	},
	actions: {
		async update() {
			const response = await DojoService.getMyDojo();
			this.dojoId = response.dojo.id;
			this.activeChallenge = response.dojo.activeChallenge;
			this.reputation = response.dojo.reputation;
			this.DojoChallengeHistory = response.dojo.DojoChallengeHistory;
			this.TournamentTeam = response.dojo.TournamentTeam;
			this.rank = response.rank;
			this.currentTournament = response.tournament;

			const totalVictory = this.DojoChallengeHistory.filter(f => f.victory).length;
			const totalFight = this.DojoChallengeHistory.length;
			const worth = Math.round((totalVictory / totalFight) * 100);
			this.worth = isNaN(worth) ? 0 : worth;
			this.tournamentInfo = await DojoService.getTournamentInfo();
			this.myTeam = await DojoService.getTournamentTeam();
		},
		async updateTeam() {
			this.myTeam = await DojoService.getTournamentTeam();
		},
		incrementCashPrice(quantity: number) {
			if (this.currentTournament) {
				this.currentTournament.cashPrice += quantity;
			}
		},
		deleteTeam() {
			this.myTeam = [];
		}
	},
	persist: {
		storage: window.localStorage
	}
});
