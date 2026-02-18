import type { UserStore } from '@dinorpg/core/models/store/userStore.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import type { UserRole } from '@dinorpg/core/models/user/userRole.js';
import { defineStore } from 'pinia';

export const userStore = defineStore('userStore', {
	state: (): UserStore => ({
		id: null,
		name: null,
		role: null as UserRole | null,
		gold: 0,
		treasureTicket: 0,
		sortOption: 'default'
	}),
	getters: {
		isLogged: state => !!state.id,
		getUserName: state => state.name,
		isAdmin: state => state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		isModerator: state => state.role === 'MODERATOR' || state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		getSortOption: (state: UserStore) => state.sortOption
	},
	actions: {
		setUser(data: UserData) {
			this.id = data.id;
			this.name = data.name;
			this.role = data.role;
			this.gold = data.gold;
			this.treasureTicket = data.treasureTicket;
		},
		setGold(gold: number) {
			this.gold = gold;
		},
		setSortOption(sortOption: string): void {
			this.sortOption = sortOption;
		},
		clearUser() {
			this.id = null;
			this.name = null;
			this.role = null;
			this.gold = 0;
			this.treasureTicket = 0;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
