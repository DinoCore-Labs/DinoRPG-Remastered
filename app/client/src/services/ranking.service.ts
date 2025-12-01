import { http } from '../utils/http';

export const RankingService = {
	async getRanking(sort: string, page: number) {
		return http()
			.get(`/ranking/${sort}/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
