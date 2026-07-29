import { api } from '../utils/http';

export interface AdminReport {
	id: number;
	reporterId: string;
	reporter: { id: string; name: string };
	reportedUserId: string | null;
	reportedUser: { id: string; name: string } | null;
	reportedDinozId: number | null;
	reportedDinoz: { id: number; name: string; userId: string | null } | null;
	reportedClanId: number | null;
	reportedClan: { id: number; name: string } | null;
	reason: string;
	comment: string | null;
	status: 'PENDING' | 'RESOLVED' | 'REJECTED';
	createdAt: string;
	updatedAt: string;
}
export interface AdminReportsResponse {
	reports: AdminReport[];
	total: number;
}

export class AdminReportService {
	static async getReports(page: number = 1): Promise<AdminReportsResponse> {
		return await api.get<AdminReportsResponse>(`/admin/reports?page=${page}`);
	}

	static async updateReportStatus(
		id: number,
		payload: {
			status?: 'PENDING' | 'RESOLVED' | 'REJECTED';
			comment?: string | null;
			banDuration?: string | null;
			muteDuration?: string | null;
		}
	): Promise<void> {
		await api.patch(`/admin/reports/${id}`, payload);
	}
}
