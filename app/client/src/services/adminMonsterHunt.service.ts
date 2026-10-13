import type {
	AdminCreateMonsterHuntPayload,
	AdminMonsterHuntActionResponse,
	AdminMonsterHuntOverview
} from '@dinorpg/core/models/admin/adminMonsterHunt.js';

import { api } from '../utils/http';

export const AdminMonsterHuntService = {
	getOverview(): Promise<AdminMonsterHuntOverview> {
		return api.get('/admin/monster-hunts');
	},
	create(payload: AdminCreateMonsterHuntPayload): Promise<
		AdminMonsterHuntActionResponse & {
			id: string;
		}
	> {
		return api.post('/admin/monster-hunts', payload);
	},
	startNow(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.post(`/admin/monster-hunts/${id}/start-now`);
	},
	endNow(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.post(`/admin/monster-hunts/${id}/end-now`);
	},
	publishStartNews(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.post(`/admin/monster-hunts/${id}/news/start`);
	},
	publishEndNews(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.post(`/admin/monster-hunts/${id}/news/end`);
	},
	distributeRewards(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.post(`/admin/monster-hunts/${id}/rewards/distribute`);
	},
	runLifecycle(): Promise<AdminMonsterHuntActionResponse> {
		return api.post('/admin/monster-hunts/lifecycle/run');
	},
	delete(id: string): Promise<AdminMonsterHuntActionResponse> {
		return api.delete(`/admin/monster-hunts/${id}`);
	}
};
