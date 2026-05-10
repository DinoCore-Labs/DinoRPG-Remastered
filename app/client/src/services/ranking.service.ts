import type { RankingEntry, RankingPositionResponse } from '@dinorpg/core/models/ranking/rankingEntry.js';

import { api } from '../utils/http';

export const RankingService = {
	getRanking(sort: string, page: number): Promise<RankingEntry[]> {
		return api.get<RankingEntry[]>(`/ranking/list/${sort}/${page}`);
	},
	getPositionRanking(userId: string): Promise<RankingPositionResponse> {
		return api.get<RankingPositionResponse>(`/ranking/position/${encodeURIComponent(userId)}`);
	}
};
