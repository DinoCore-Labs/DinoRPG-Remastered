import type {
	ClanRankingEntry,
	DojoRankingEntry,
	EventClanRankingEntry,
	EventPlayerRankingEntry,
	EventRankingResponse,
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
	getEventPlayersRanking(
		eventId: string,
		page: number,
		edition?: number
	): Promise<EventRankingResponse<EventPlayerRankingEntry>> {
		const query = edition ? `?edition=${edition}` : '';
		return api.get<EventRankingResponse<EventPlayerRankingEntry>>(`/ranking/event/players/${eventId}/${page}${query}`);
	},
	getEventClansRanking(
		eventId: string,
		page: number,
		edition?: number
	): Promise<EventRankingResponse<EventClanRankingEntry>> {
		const query = edition ? `?edition=${edition}` : '';
		return api.get<EventRankingResponse<EventClanRankingEntry>>(`/ranking/event/clans/${eventId}/${page}${query}`);
	}
};
