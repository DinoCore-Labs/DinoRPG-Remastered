import type { AdminDinozSummary, AdminUserDetails } from '@dinorpg/core/models/admin/adminUser.js';
import type {
	UpdateAdminUserInventoryPayload,
	UpdateAdminUserPasswordPayload,
	UpdateAdminUserProfilePayload,
	UpdateAdminUserRewardsPayload,
	UpdateAdminUserScenarioPayload,
	UpdateAdminUserUniqueSkillsPayload,
	UpdateAdminUserWalletPayload
} from '@dinorpg/core/models/admin/adminUserPayloads.js';

import { api } from '../utils/http';

type OkResponse = {
	ok: boolean;
};

const getAdminUserPath = (userId: string): string => `/admin/user/${encodeURIComponent(userId)}`;

export const AdminUserService = {
	getUserDetails(userId: string): Promise<AdminUserDetails> {
		return api.get<AdminUserDetails>(getAdminUserPath(userId));
	},
	getUserDinoz(userId: string): Promise<AdminDinozSummary[]> {
		return api.get<AdminDinozSummary[]>(`${getAdminUserPath(userId)}/dinoz`);
	},
	updateUserProfile(userId: string, payload: UpdateAdminUserProfilePayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminUserPath(userId)}/profile`, payload);
	},
	updateUserWallet(userId: string, payload: UpdateAdminUserWalletPayload): Promise<OkResponse> {
		return api.post<OkResponse>(`${getAdminUserPath(userId)}/wallets/update`, payload);
	},
	updateUserUniqueSkills(userId: string, payload: UpdateAdminUserUniqueSkillsPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminUserPath(userId)}/unique-skills`, payload);
	},
	updateUserItems(userId: string, payload: UpdateAdminUserInventoryPayload): Promise<void> {
		return api.patch<void>(`${getAdminUserPath(userId)}/items`, payload);
	},
	updateUserIngredients(userId: string, payload: UpdateAdminUserInventoryPayload): Promise<void> {
		return api.patch<void>(`${getAdminUserPath(userId)}/ingredients`, payload);
	},
	updateUserRewards(userId: string, payload: UpdateAdminUserRewardsPayload): Promise<void> {
		return api.patch<void>(`${getAdminUserPath(userId)}/rewards`, payload);
	},
	updateUserPassword(userId: string, payload: UpdateAdminUserPasswordPayload): Promise<void> {
		return api.patch<void>(`${getAdminUserPath(userId)}/password`, payload);
	},
	updateUserScenario(userId: string, payload: UpdateAdminUserScenarioPayload): Promise<void> {
		return api.patch<void>(`${getAdminUserPath(userId)}/scenarios`, payload);
	}
};
