import type { PublicNewsListItem } from '@dinorpg/core/models/news/news.js';
import type { ToggleNewsLikeResult, VotePollResult } from '@dinorpg/core/models/news/newsInput.js';

import { http } from '../utils/http';

export const NewsService = {
	async getNewsPage(page: number): Promise<PublicNewsListItem[]> {
		return http()
			.get(`/news/page/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async toggleLike(newsId: number): Promise<ToggleNewsLikeResult> {
		return http()
			.post(`/news/${newsId}/like`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async voteToPoll(pollId: number, optionId: number): Promise<VotePollResult> {
		return http()
			.post(`/news/polls/${pollId}/vote/${optionId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
