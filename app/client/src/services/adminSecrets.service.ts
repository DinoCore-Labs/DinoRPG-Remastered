import type { AdminSecret } from '@dinorpg/core/models/admin/adminSecrets.js';

import { http } from '../utils/http';

export const AdminSecretService = {
	getSecrets(): Promise<AdminSecret[]> {
		return http()
			.get('/admin/secrets')
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateSecret(key: string, value: string): Promise<AdminSecret> {
		return http()
			.put(`/admin/secrets/${encodeURIComponent(key)}`, { value })
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
