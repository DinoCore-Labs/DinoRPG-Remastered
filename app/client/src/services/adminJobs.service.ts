import type { JobDefinition, JobRun } from '@dinorpg/core/models/admin/adminJobs.js';

import { api } from '../utils/http';

type OkResponse = {
	ok: boolean;
};

const getAdminJobPath = (key: string): string => `/admin/jobs/${encodeURIComponent(key)}`;

export const AdminJobsService = {
	list(): Promise<JobDefinition[]> {
		return api.get<JobDefinition[]>('/admin/jobs');
	},
	getRuns(key: string): Promise<JobRun[]> {
		return api.get<JobRun[]>(`${getAdminJobPath(key)}/runs`);
	},
	runNow(key: string): Promise<OkResponse> {
		return api.post<OkResponse>(`${getAdminJobPath(key)}/run`);
	}
};
