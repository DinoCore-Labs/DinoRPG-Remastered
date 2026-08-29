import type { Language } from '@dinorpg/core/models/config/language.js';
import type { PublicNewsListItem } from '@dinorpg/core/models/news/news.js';
import type { ToggleNewsLikeResult, VotePollResult } from '@dinorpg/core/models/news/newsInput.js';

import { api, API_BASE } from '../utils/http';

export const NewsService = {
	getNewsPage(page: number, lang: Language): Promise<PublicNewsListItem[]> {
		return api.get<PublicNewsListItem[]>(`/news/page/${page}`, {
			params: { lang }
		});
	},
	getImageUrl(newsId: number): string {
		return `${API_BASE}/news/${newsId}/image`;
	},
	toggleLike(newsId: number): Promise<ToggleNewsLikeResult> {
		return api.post<ToggleNewsLikeResult>(`/news/${newsId}/like`);
	},
	voteToPoll(pollId: number, optionId: number): Promise<VotePollResult> {
		return api.post<VotePollResult>(`/news/polls/${pollId}/vote/${optionId}`);
	}
};
