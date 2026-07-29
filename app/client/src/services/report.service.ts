import { api } from '../utils/http';

export interface CreateReportPayload {
	reason: string;
	comment?: string;
	reportedUserId?: string;
	reportedDinozId?: number;
	reportedClanId?: number;
}

export class ReportService {
	static async createReport(payload: CreateReportPayload): Promise<void> {
		await api.post('/reports', payload);
	}
}
