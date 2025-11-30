import { type UserStore } from '@dinorpg/core/models/store/UserStore';
import { type UserData } from '@dinorpg/core/models/user/UserData';
import type { UserRole } from '@dinorpg/core/models/user/UserRole';
import { defineStore } from 'pinia';

export const userStore = defineStore('userStore', {
	state: (): UserStore => ({
		id: null,
		name: null,
		role: null as UserRole | null,
		gold: 0
	}),
	getters: {
		isLogged: state => !!state.id,
		getUserName: state => state.name,
		isAdmin: state => state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		isModerator: state => state.role === 'MODERATOR' || state.role === 'ADMIN' || state.role === 'SUPER_ADMIN'
	},
	actions: {
		setUser(data: UserData) {
			this.id = data.id;
			this.name = data.name;
			this.role = data.role;
			this.gold = data.gold;
		},
		clearUser() {
			this.id = null;
			this.name = null;
			this.role = null;
		}
	},
	persist: {
		storage: window.sessionStorage
	}
});
