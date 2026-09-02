/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/3a73bbc6d751e4916cc5fd2e5f23bc2cfd42fc6d/ed-ui/src/store/clanStore.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors from 2026-06-13 through 2026-07-01.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */
import { Language } from '@dinorpg/core/models/config/language.js';
import type { ClanStore } from '@dinorpg/core/models/store/clanStore.js';
import { defineStore } from 'pinia';

import { ClanService } from '../services/clan.service.js';
import { userStore } from './userStore';

export const clanStore = defineStore('clanStore', {
	state: (): ClanStore => ({
		clan: undefined,
		myClan: undefined,
		clanEvent: undefined
	}),
	getters: {
		getClan: (state: ClanStore) => state.clan,
		getMyclan: (state: ClanStore) => state.myClan,
		getClanId: (state: ClanStore) => state.clan?.id ?? 0,
		getOngoingEvent: (state: ClanStore) => {
			if (state.clanEvent && state.clanEvent.endDate > new Date()) {
				return state.clanEvent.id;
			}
		}
	},
	actions: {
		async loadClan(clanId: number) {
			this.clan = undefined;
			this.clan = await ClanService.getClan(clanId);
			if (this.clan.id === userStore().clanId) {
				this.myClan = this.clan;
			}
		},
		async updateLang(clanId: number, languages: Language[]) {
			if (this.clan) {
				const response = await ClanService.updateClanLangs(clanId, languages);
				this.clan.languages.splice(0);
				this.clan.languages.push(...response);
			}
		},
		updateBanner(banner: string): void {
			if (!this.clan) return;
			this.clan.banner = banner;
		},
		updateName(name: string): void {
			if (!this.clan) return;
			this.clan.name = name;
		},
		updateLeader(leaderName: string, leaderId: string): void {
			if (!this.clan) return;
			this.clan.leader.name = leaderName;
			this.clan.leader.id = leaderId;
		},
		setClanEvent(clanEvent: { id: string; endDate: Date } | undefined): void {
			this.clanEvent = clanEvent;
		}
	},
	persist: {
		storage: window.localStorage
	}
});
