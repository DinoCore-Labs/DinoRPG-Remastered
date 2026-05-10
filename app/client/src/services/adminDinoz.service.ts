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
	UpdateAdminDinozMissionPayload,
	UpdateAdminDinozProfilePayload,
	UpdateAdminDinozSkillStatePayload,
	UpdateAdminDinozStatePayload,
	UpdateAdminDinozStatsPayload
} from '@dinorpg/core/models/admin/adminDinozPayloads.js';

import { api } from '../utils/http';

type OkResponse = {
	ok: boolean;
};

const getAdminDinozPath = (userId: string, dinozId: number): string =>
	`/admin/user/${encodeURIComponent(userId)}/dinoz/${dinozId}`;

const getAdminDinozMissionPath = (userId: string, dinozId: number, missionKey: string): string =>
	`${getAdminDinozPath(userId, dinozId)}/missions/${encodeURIComponent(missionKey)}`;

export const AdminDinozService = {
	getDinozDetails(userId: string, dinozId: number): Promise<AdminDinozDetails> {
		return api.get<AdminDinozDetails>(getAdminDinozPath(userId, dinozId));
	},
	updateDinozProfile(userId: string, dinozId: number, payload: UpdateAdminDinozProfilePayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/profile`, payload);
	},
	updateDinozStats(userId: string, dinozId: number, payload: UpdateAdminDinozStatsPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/stats`, payload);
	},
	updateDinozState(userId: string, dinozId: number, payload: UpdateAdminDinozStatePayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/state`, payload);
	},
	teleportDinoz(userId: string, dinozId: number, payload: TeleportAdminDinozPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/place`, payload);
	},
	updateDinozLeader(userId: string, dinozId: number, payload: UpdateAdminDinozLeaderPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/leader`, payload);
	},
	addDinozStatus(userId: string, dinozId: number, payload: AddAdminDinozStatusPayload): Promise<OkResponse> {
		return api.post<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/status`, payload);
	},
	removeDinozStatus(userId: string, dinozId: number, payload: RemoveAdminDinozStatusPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/status/remove`, payload);
	},
	addDinozSkill(userId: string, dinozId: number, payload: AddAdminDinozSkillPayload): Promise<OkResponse> {
		return api.post<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/skills`, payload);
	},
	updateDinozSkillState(
		userId: string,
		dinozId: number,
		payload: UpdateAdminDinozSkillStatePayload
	): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/skills/state`, payload);
	},
	removeDinozSkill(userId: string, dinozId: number, payload: RemoveAdminDinozSkillPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/skills/remove`, payload);
	},
	addDinozUnlockableSkill(
		userId: string,
		dinozId: number,
		payload: AddAdminDinozUnlockableSkillPayload
	): Promise<OkResponse> {
		return api.post<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/unlockable-skills`, payload);
	},
	removeDinozUnlockableSkill(
		userId: string,
		dinozId: number,
		payload: RemoveAdminDinozUnlockableSkillPayload
	): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/unlockable-skills/remove`, payload);
	},
	updateDinozItems(userId: string, dinozId: number, payload: UpdateAdminDinozItemsPayload): Promise<OkResponse> {
		return api.patch<OkResponse>(`${getAdminDinozPath(userId, dinozId)}/items`, payload);
	},
	updateDinozMission(
		userId: string,
		dinozId: number,
		missionKey: string,
		payload: UpdateAdminDinozMissionPayload
	): Promise<OkResponse> {
		return api.patch<OkResponse>(getAdminDinozMissionPath(userId, dinozId, missionKey), payload);
	},
	makeDinozMissionReplayable(userId: string, dinozId: number, missionKey: string): Promise<OkResponse> {
		return api.delete<OkResponse>(`${getAdminDinozMissionPath(userId, dinozId, missionKey)}/replayable`);
	}
};
