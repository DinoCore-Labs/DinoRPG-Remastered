import type { AdminNewsPayload } from '@dinorpg/core/models/admin/adminNewsPayload.js';
import type { AdminNewsListItem, DetailedNews } from '@dinorpg/core/models/news/news.js';

import { api } from '../utils/http';

const getAdminNewsPath = (newsId: number): string => `/admin/news/${newsId}`;

const createNewsFormData = (payload: AdminNewsPayload | Partial<AdminNewsPayload>, image: File): FormData => {
	const formData = new FormData();
	formData.append('image', image);
	formData.append('payload', JSON.stringify(payload));
	return formData;
};

export const AdminNewsService = {
	getAdminNewsList(): Promise<AdminNewsListItem[]> {
		return api.get<AdminNewsListItem[]>('/admin/news');
	},
	getAdminNewsDetails(newsId: number): Promise<DetailedNews> {
		return api.get<DetailedNews>(getAdminNewsPath(newsId));
	},
	createAdminNews(payload: AdminNewsPayload): Promise<DetailedNews> {
		return api.post<DetailedNews>('/admin/news', payload);
	},
	updateAdminNews(newsId: number, payload: Partial<AdminNewsPayload>): Promise<DetailedNews> {
		return api.put<DetailedNews>(getAdminNewsPath(newsId), payload);
	},
	createAdminNewsWithImage(payload: AdminNewsPayload, image: File): Promise<DetailedNews> {
		return api.post<DetailedNews>('/admin/news', createNewsFormData(payload, image));
	},
	updateAdminNewsWithImage(newsId: number, payload: Partial<AdminNewsPayload>, image: File): Promise<DetailedNews> {
		return api.put<DetailedNews>(getAdminNewsPath(newsId), createNewsFormData(payload, image));
	},
	deleteNews(newsId: number): Promise<void> {
		return api.delete<void>(getAdminNewsPath(newsId));
	}
};
