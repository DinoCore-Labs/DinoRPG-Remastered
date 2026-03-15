import type { AdminDinozDetails } from '@dinorpg/core/models/admin/adminDinoz.js';
import type {
	AddAdminDinozSkillPayload,
	AddAdminDinozStatusPayload,
	AddAdminDinozUnlockableSkillPayload,
	RemoveAdminDinozSkillPayload,
	RemoveAdminDinozStatusPayload,
	RemoveAdminDinozUnlockableSkillPayload,
	TeleportAdminDinozPayload,
	UpdateAdminDinozItemsPayload,
	UpdateAdminDinozLeaderPayload,
	UpdateAdminDinozProfilePayload,
	UpdateAdminDinozSkillStatePayload,
	UpdateAdminDinozStatePayload,
	UpdateAdminDinozStatsPayload
} from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { http } from '../utils/http';

export const AdminDinozService = {
	getDinozDetails(userId: string, dinozId: number): Promise<AdminDinozDetails> {
		return http()
			.get(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozProfile(
		userId: string,
		dinozId: number,
		payload: UpdateAdminDinozProfilePayload
	): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/profile`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozStats(userId: string, dinozId: number, payload: UpdateAdminDinozStatsPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/stats`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozState(userId: string, dinozId: number, payload: UpdateAdminDinozStatePayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/state`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	teleportDinoz(userId: string, dinozId: number, payload: TeleportAdminDinozPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/place`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozLeader(userId: string, dinozId: number, payload: UpdateAdminDinozLeaderPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/leader`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	addDinozStatus(userId: string, dinozId: number, payload: AddAdminDinozStatusPayload): Promise<{ ok: boolean }> {
		return http()
			.post(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/status`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	removeDinozStatus(userId: string, dinozId: number, payload: RemoveAdminDinozStatusPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/status/remove`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	addDinozSkill(userId: string, dinozId: number, payload: AddAdminDinozSkillPayload): Promise<{ ok: boolean }> {
		return http()
			.post(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/skills`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozSkillState(
		userId: string,
		dinozId: number,
		payload: UpdateAdminDinozSkillStatePayload
	): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/skills/state`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	removeDinozSkill(userId: string, dinozId: number, payload: RemoveAdminDinozSkillPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/skills/remove`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	addDinozUnlockableSkill(
		userId: string,
		dinozId: number,
		payload: AddAdminDinozUnlockableSkillPayload
	): Promise<{ ok: boolean }> {
		return http()
			.post(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/unlockable-skills`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	removeDinozUnlockableSkill(
		userId: string,
		dinozId: number,
		payload: RemoveAdminDinozUnlockableSkillPayload
	): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/unlockable-skills/remove`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},
	updateDinozItems(userId: string, dinozId: number, payload: UpdateAdminDinozItemsPayload): Promise<{ ok: boolean }> {
		return http()
			.patch(`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}/items`, payload)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
