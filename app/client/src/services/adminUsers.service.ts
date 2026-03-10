import type { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import type {
	UpdateAdminUserProfilePayload,
	UpdateAdminUserWalletPayload
} from '@dinorpg/core/models/admin/adminUserPayloads.js';

import { http } from '../utils/http';

export const AdminUserService = {
	getUserDetails(userId: string): Promise<AdminUserDetails> {
		return http()
			.get(`/admin/user/${encodeURIComponent(userId)}`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	getUserDinoz(userId: string): Promise<AdminDinozSummary[]> {
		return http()
			.get(`/admin/user/${encodeURIComponent(userId)}/dinoz`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateUserProfile(userId: string, payload: UpdateAdminUserProfilePayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/profile`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateUserWallet(userId: string, payload: UpdateAdminUserWalletPayload): Promise<{ ok: boolean }> {
		return http()
			.post(`/admin/user/${encodeURIComponent(userId)}/wallets/update`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
