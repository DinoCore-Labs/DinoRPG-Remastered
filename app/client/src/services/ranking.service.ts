import type {
	ClanRankingEntry,
	DojoRankingEntry,
	RankingEntry,
	RankingPositionResponse
} from '@dinorpg/core/models/ranking/rankingEntry.js';

import { api } from '../utils/http';

export const RankingService = {
	getRanking(sort: string, page: number): Promise<RankingEntry[]> {
		return api.get<RankingEntry[]>(`/ranking/list/${sort}/${page}`);
	},
	getClanRanking(sort: string, page: number): Promise<ClanRankingEntry[]> {
		return api.get<ClanRankingEntry[]>(`/ranking/clan/${sort}/${page}`);
	},
	getPositionRanking(userId: string): Promise<RankingPositionResponse> {
		return api.get<RankingPositionResponse>(`/ranking/position/${encodeURIComponent(userId)}`);
	},
	getDojoRanking(sort: string, page: number): Promise<DojoRankingEntry[]> {
		return api.get<DojoRankingEntry[]>(`/ranking/list/${sort}/${page}`);
	},
	getEventPlayersRanking(eventId: string, page: number): Promise<any> {
		return api.get<any>(`/ranking/event/players/${eventId}/${page}`);
	},
	getEventClansRanking(eventId: string, page: number): Promise<any> {
		return api.get<any>(`/ranking/event/clans/${eventId}/${page}`);
	}
};
