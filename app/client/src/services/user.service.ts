import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import type { UserToolTip } from '@dinorpg/core/models/user/userToolTip.js';
import type { EntitySearch } from '@dinorpg/core/models/utils/entitySearch.js';

import { api } from '../utils/http';

export const UserService = {
	register(name: string, password: string) {
		return api.post('/users/register', { name, password });
	},
	login(name: string, password: string) {
		return api.post('/users/login', { name, password });
	},
	logout() {
		return api.delete('/users/logout');
	},
	me() {
		return api.get('/users/me');
	},
	checkName(name: string) {
		return api.get(`/users/check-name/${name}`, {
			silent: true
		});
	},
	search(name: string): Promise<EntitySearch[]> {
		return api.get<EntitySearch[]>(`/users/search/${name}`);
	},
	getToolTip(id: string): Promise<UserToolTip> {
		return api.get<UserToolTip>(`/users/tooltip/${id}`, {
			silent: true
		});
	},
	getMyProfile(): Promise<UserProfile> {
		return api.get<UserProfile>('/users/me/profile');
	},
	getPublicProfile(id: string): Promise<UserProfile> {
		return api.get<UserProfile>(`/users/${id}/profile`);
	},
	updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
		const payload: Partial<UserProfile> = {};
		if (data.description !== undefined) payload.description = data.description;
		if (data.customText !== undefined) payload.customText = data.customText;
		if (data.gender !== undefined) payload.gender = data.gender;
		if (data.language !== undefined) payload.language = data.language;
		if (data.age !== undefined) payload.age = data.age;
		return api.put<UserProfile>('/users/me/profile', payload);
	},
	uploadAvatar(file: File): Promise<UserProfile> {
		const form = new FormData();
		form.append('avatar', file);
		return api.post<UserProfile>('/users/me/avatar', form, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
	},
	changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
		return api.patch<void>('/users/me/password', {
			oldPassword,
			newPassword,
			confirmPassword
		});
	}
};
