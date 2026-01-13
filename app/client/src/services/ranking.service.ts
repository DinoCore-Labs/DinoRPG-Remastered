import { http } from '../utils/http';

export const RankingService = {
	async getRanking(sort: string, page: number) {
		return http()
			.get(`/ranking/list/${sort}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getPositionRanking(userId: string) {
		return http()
			.get(`/ranking/position/${userId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
