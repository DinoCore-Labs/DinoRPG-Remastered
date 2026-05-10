import type { CheckNameResponse } from '@dinorpg/core/models/user/checkNameResponse.js';
import type { UserData } from '@dinorpg/core/models/user/userData.js';
import type { UserProfile } from '@dinorpg/core/models/user/userProfile.js';
import type { UserToolTip } from '@dinorpg/core/models/user/userToolTip.js';
import type { EntitySearch } from '@dinorpg/core/models/utils/entitySearch.js';

import { api } from '../utils/http';

export const UserService = {
	register(name: string, password: string): Promise<UserData> {
		return api.post<UserData>('/users/register', {
			name,
			password
		});
	},
	login(name: string, password: string): Promise<UserData> {
		return api.post<UserData>('/users/login', {
			name,
			password
		});
	},
	logout(): Promise<void> {
		return api.delete<void>('/users/logout');
	},
	me(): Promise<UserData> {
		return api.get<UserData>('/users/me');
	},
	checkName(name: string): Promise<CheckNameResponse> {
		return api.get<CheckNameResponse>(`/users/check-name/${encodeURIComponent(name)}`, {
			silent: true
		});
	},
	search(name: string): Promise<EntitySearch[]> {
		return api.get<EntitySearch[]>(`/users/search/${encodeURIComponent(name)}`);
	},
	getToolTip(id: string): Promise<UserToolTip> {
		return api.get<UserToolTip>(`/users/tooltip/${encodeURIComponent(id)}`, {
			silent: true
		});
	},
	getMyProfile(): Promise<UserProfile> {
		return api.get<UserProfile>('/users/me/profile');
	},
	getPublicProfile(id: string): Promise<UserProfile> {
		return api.get<UserProfile>(`/users/${encodeURIComponent(id)}/profile`);
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
		return api.post<UserProfile>('/users/me/avatar', form);
	},
	changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> {
		return api.patch<void>('/users/me/password', {
			oldPassword,
			newPassword,
			confirmPassword
		});
	}
};
