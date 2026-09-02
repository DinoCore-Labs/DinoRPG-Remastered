import type { AdminRoadmapEntry, AdminRoadmapPayload } from '@dinorpg/core/models/roadmap/roadmap.js';

import { api } from '../utils/http';

export const AdminRoadmapService = {
	getRoadmap(): Promise<AdminRoadmapEntry[]> {
		return api.get<AdminRoadmapEntry[]>('/admin/roadmap');
	},
	updateRoadmap(payload: AdminRoadmapPayload): Promise<AdminRoadmapEntry[]> {
		return api.put<AdminRoadmapEntry[], AdminRoadmapPayload>('/admin/roadmap', payload);
	}
};
