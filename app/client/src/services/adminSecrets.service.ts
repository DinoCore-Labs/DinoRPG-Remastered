import type { AdminSecret } from '@dinorpg/core/models/admin/adminSecrets.js';

import { api } from '../utils/http';

const getAdminSecretPath = (key: string): string => `/admin/secrets/${encodeURIComponent(key)}`;

export const AdminSecretService = {
	getSecrets(): Promise<AdminSecret[]> {
		return api.get<AdminSecret[]>('/admin/secrets');
	},
	updateSecret(key: string, value: string): Promise<AdminSecret> {
		return api.put<AdminSecret>(getAdminSecretPath(key), {
			value
		});
	}
};
