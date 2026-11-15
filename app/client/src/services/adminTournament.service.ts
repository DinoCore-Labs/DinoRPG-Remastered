import type {
	AdminCreateTournamentPayload,
	AdminTournamentActionResponse,
	AdminTournamentOverview
} from '@dinorpg/core/models/admin/adminTournament.js';

import { api } from '../utils/http';

export const AdminTournamentService = {
	getOverview(): Promise<AdminTournamentOverview> {
		return api.get<AdminTournamentOverview>('/admin/tournament');
	},
	create(payload?: AdminCreateTournamentPayload): Promise<AdminTournamentActionResponse> {
		return api.post<AdminTournamentActionResponse>('/admin/tournament', payload ?? {});
	},
	runNextStep(): Promise<AdminTournamentActionResponse> {
		return api.post<AdminTournamentActionResponse>('/admin/tournament/next-step');
	},
	runStepByKey(key: string): Promise<AdminTournamentActionResponse> {
		return api.post<AdminTournamentActionResponse>(`/admin/tournament/step/${encodeURIComponent(key)}`);
	}
};
