import type { UserToolTip } from '@dinorpg/core/models/user/UserToolTip.mjs';
import type { EntitySearch } from '@dinorpg/core/models/utils/EntitySearch.mjs';

import { http } from '../utils/http';

export const UserService = {
	register(name: string, password: string) {
		return http()
			.post('/users/register', { name, password })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	login(name: string, password: string) {
		return http()
			.post('/users/login', { name, password })
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	logout() {
		return http()
			.delete('/users/logout')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	me() {
		return http()
			.get('/users/me')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	checkName(name: string) {
		return http()
			.get(`/users/check-name/${name}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	search: async (name: string): Promise<EntitySearch[]> => {
		return http()
			.get(`/users/search/${name}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getToolTip: async (id: string): Promise<UserToolTip> => {
		return http()
			.get(`/users/tooltip/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
