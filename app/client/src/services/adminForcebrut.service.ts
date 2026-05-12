import type {
	AdminForcebrutOpponent,
	AdminForcebrutOpponentPayload
} from '@dinorpg/core/models/admin/adminForcebrut.js';

import { api } from '../utils/http';

const BASE_PATH = '/admin/forcebrut/opponents';

export const AdminForcebrutService = {
	getOpponents(): Promise<AdminForcebrutOpponent[]> {
		return api.get<AdminForcebrutOpponent[]>(BASE_PATH);
	},
	getOpponent(id: number): Promise<AdminForcebrutOpponent> {
		return api.get<AdminForcebrutOpponent>(`${BASE_PATH}/${id}`);
	},
	createOpponent(payload: AdminForcebrutOpponentPayload): Promise<AdminForcebrutOpponent> {
		return api.post<AdminForcebrutOpponent, AdminForcebrutOpponentPayload>(BASE_PATH, payload);
	},
	updateOpponent(id: number, payload: AdminForcebrutOpponentPayload): Promise<AdminForcebrutOpponent> {
		return api.put<AdminForcebrutOpponent, AdminForcebrutOpponentPayload>(`${BASE_PATH}/${id}`, payload);
	},
	deleteOpponent(id: number): Promise<{ ok: boolean }> {
		return api.delete<{ ok: boolean }>(`${BASE_PATH}/${id}`);
	}
};
