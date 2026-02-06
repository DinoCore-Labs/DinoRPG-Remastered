import type { JobDefinition, JobRun } from '@dinorpg/core/models/admin/adminJobs.js';

import { http } from '../utils/http';

export const AdminJobsService = {
	list(): Promise<JobDefinition[]> {
		return http()
			.get('/admin/jobs')
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},

	getRuns(key: string): Promise<JobRun[]> {
		return http()
			.get(`/admin/jobs/${encodeURIComponent(key)}/runs`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	},

	runNow(key: string): Promise<{ ok: boolean }> {
		return http()
			.post(`/admin/jobs/${encodeURIComponent(key)}/run`)
			.then(res => res.data)
			.catch(err => Promise.reject(err));
	}
};
