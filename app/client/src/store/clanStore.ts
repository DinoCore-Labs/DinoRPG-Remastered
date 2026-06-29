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
		storage: window.sessionStorage
	}
});
