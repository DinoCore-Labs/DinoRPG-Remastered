import type { Language } from '@dinorpg/core/models/config/language.js';
import type { PublicNewsListItem } from '@dinorpg/core/models/news/news.js';
import type { ToggleNewsLikeResult, VotePollResult } from '@dinorpg/core/models/news/newsInput.js';

import { api } from '../utils/http';

export const NewsService = {
	getNewsPage(page: number, lang: Language): Promise<PublicNewsListItem[]> {
		return api.get<PublicNewsListItem[]>(`/news/page/${page}`, {
			params: { lang }
		});
	},
	toggleLike(newsId: number): Promise<ToggleNewsLikeResult> {
		return api.post<ToggleNewsLikeResult>(`/news/${newsId}/like`);
	},
	voteToPoll(pollId: number, optionId: number): Promise<VotePollResult> {
		return api.post<VotePollResult>(`/news/polls/${pollId}/vote/${optionId}`);
	}
};
