import { api } from '../utils/http';

export const RankingService = {
	getRanking(sort: string, page: number) {
		return api.get(`/ranking/list/${sort}/${page}`);
	},
	getPositionRanking(userId: string) {
		return api.get(`/ranking/position/${userId}`);
	}
};
