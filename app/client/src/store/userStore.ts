import { type UserStore } from '@dinorpg/core/models/store/UserStore';
import type { UserRole } from '@dinorpg/core/models/user/UserRole';
import { defineStore } from 'pinia';

export const userStore = defineStore('userStore', {
	state: (): UserStore => ({
		id: null,
		name: null,
		role: null as UserRole | null
	}),
	getters: {
		isLogged: state => !!state.id,
		getUserName: state => state.name,
		isAdmin: state => state.role === 'ADMIN' || state.role === 'SUPER_ADMIN',
		isModerator: state => state.role === 'MODERATOR' || state.role === 'ADMIN' || state.role === 'SUPER_ADMIN'
	},
	actions: {
		setUser(id: string, name: string, role: UserStore['role']) {
			this.id = id;
			this.name = name;
			this.role = role;
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
