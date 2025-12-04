import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import type { UserToolTip } from '@dinorpg/core/models/user/userToolTip.js';
import type { EntitySearch } from '@dinorpg/core/models/utils/entitySearch.js';

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
	},
	getMyProfile(): Promise<UserProfile> {
		return http()
			.get('/users/me/profile')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getPublicProfile(id: string): Promise<UserProfile> {
		return http()
			.get(`/users/${id}/profile`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
		const payload = {
			description: data.description ?? null,
			gender: data.gender ?? null,
			language: data.language ?? null,
			age: data.age ?? null
		};
		return http()
			.put('/users/me/profile', payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	uploadAvatar(file: File): Promise<UserProfile> {
		const form = new FormData();
		form.append('avatar', file);
		return http()
			.post('/users/me/avatar', form, {
				headers: { 'Content-Type': 'multipart/form-data' }
			})
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
