import type { PublicNewsListItem } from '@dinorpg/core/models/news/news.js';

import { http } from '../utils/http';

export const NewsService = {
	async getNewsPage(page: number): Promise<PublicNewsListItem[]> {
		return http()
			.get(`/news/page/${page}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async toggleLike(newsId: number): Promise<{ newsId: number; likes: number; likedByMe: boolean }> {
		return http()
			.post(`/news/${newsId}/like`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async voteToPoll(pollId: number, optionId: number): Promise<{ success: boolean }> {
		return http()
			.post(`/news/polls/${pollId}/vote/${optionId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
