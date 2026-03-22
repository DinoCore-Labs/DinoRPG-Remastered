import type { AdminNewsPayload } from '@dinorpg/core/models/admin/adminNewsPayload.js';
import type { AdminNewsListItem, DetailedNews } from '@dinorpg/core/models/news/news.js';

import { http } from '../utils/http';

export const AdminNewsService = {
	async getAdminNewsList(): Promise<AdminNewsListItem[]> {
		return http()
			.get('/admin/news')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getAdminNewsDetails(newsId: number): Promise<DetailedNews> {
		return http()
			.get(`/admin/news/${newsId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createAdminNews(payload: AdminNewsPayload): Promise<DetailedNews> {
		return http()
			.post('/admin/news', payload)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async updateAdminNews(newsId: number, payload: Partial<AdminNewsPayload>): Promise<DetailedNews> {
		return http()
			.patch(`/admin/news/${newsId}`, payload)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createAdminNewsWithImage(payload: AdminNewsPayload, image: File): Promise<DetailedNews> {
		const formData = new FormData();
		formData.append('image', image);
		formData.append('payload', JSON.stringify(payload));
		return http()
			.post('/admin/news', formData)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async updateAdminNewsWithImage(
		newsId: number,
		payload: Partial<AdminNewsPayload>,
		image: File
	): Promise<DetailedNews> {
		const formData = new FormData();
		formData.append('image', image);
		formData.append('payload', JSON.stringify(payload));
		return http()
			.post(`/admin/news/${newsId}`, formData)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async deleteNews(newsId: number) {
		return http()
			.delete(`/admin/news/${newsId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
