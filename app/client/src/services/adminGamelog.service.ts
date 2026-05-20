import type {
	AdminGameLogDailyEntry,
	AdminGameLogHourlyEntry,
	AdminGameLogListQuery,
	AdminGameLogListResponse,
	AdminGameLogSummaryEntry,
	GameLogType
} from '@dinorpg/core/models/admin/adminGameLog.js';

import { api } from '../utils/http';

export interface AdminGameLogHourlyQuery {
	type: GameLogType;
	date: string;
}

export interface AdminGameLogDailyQuery {
	type: GameLogType;
	from: string;
	to: string;
}

export interface AdminGameLogSummaryQuery {
	from: string;
	to: string;
}

export const AdminGameLogsService = {
	list(query: AdminGameLogListQuery = {}): Promise<AdminGameLogListResponse> {
		return api.get('/admin/logs', { params: query });
	},

	hourly(query: AdminGameLogHourlyQuery): Promise<AdminGameLogHourlyEntry[]> {
		return api.get('/admin/logs/hourly', { params: query });
	},

	daily(query: AdminGameLogDailyQuery): Promise<AdminGameLogDailyEntry[]> {
		return api.get('/admin/logs/daily', { params: query });
	},

	summary(query: AdminGameLogSummaryQuery): Promise<AdminGameLogSummaryEntry[]> {
		return api.get('/admin/logs/summary', { params: query });
	}
};
