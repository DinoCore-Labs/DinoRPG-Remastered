import type {
	CreateForumMessageInput,
	CreateForumTopicInput,
	DeleteForumMessageResponse,
	ForumCategory,
	ForumFirstUnreadResponse,
	ForumMessageCreatedResponse,
	ForumMessageView,
	ForumTopicListResponse,
	ForumTopicSummary,
	ForumTopicViewResponse,
	MarkForumTopicReadInput,
	ToggleForumFavoriteResponse,
	UpdateForumMessageInput
} from '@dinorpg/core/models/forum/forum.js';

import { api } from '../utils/http';

export const ForumService = {
	listTopics(category: ForumCategory, page = 1): Promise<ForumTopicListResponse> {
		return api.get<ForumTopicListResponse>(`/forum/categories/${category}/topics`, {
			params: {
				page
			}
		});
	},
	listFavorites(page = 1): Promise<ForumTopicListResponse> {
		return api.get<ForumTopicListResponse>('/forum/favorites', {
			params: {
				page
			}
		});
	},
	getTopic(topicId: number, page = 1): Promise<ForumTopicViewResponse> {
		return api.get<ForumTopicViewResponse>(`/forum/topics/${topicId}`, {
			params: {
				page
			}
		});
	},
	createTopic(category: ForumCategory, input: CreateForumTopicInput): Promise<ForumTopicSummary> {
		return api.post<ForumTopicSummary, CreateForumTopicInput>(`/forum/categories/${category}/topics`, input);
	},
	createMessage(topicId: number, input: CreateForumMessageInput): Promise<ForumMessageCreatedResponse> {
		return api.post<ForumMessageCreatedResponse, CreateForumMessageInput>(`/forum/topics/${topicId}/messages`, input);
	},
	updateMessage(topicId: number, messageId: number, input: UpdateForumMessageInput): Promise<ForumMessageView> {
		return api.patch<ForumMessageView, UpdateForumMessageInput>(
			`/forum/topics/${topicId}/messages/${messageId}`,
			input
		);
	},
	deleteMessage(topicId: number, messageId: number): Promise<DeleteForumMessageResponse> {
		return api.delete<DeleteForumMessageResponse>(`/forum/topics/${topicId}/messages/${messageId}`);
	},
	toggleFavorite(topicId: number): Promise<ToggleForumFavoriteResponse> {
		return api.post<ToggleForumFavoriteResponse>(`/forum/topics/${topicId}/favorite`);
	},
	setPinned(topicId: number, isPinned: boolean): Promise<{ success: true }> {
		return api.patch<{ success: true }, { isPinned: boolean }>(`/forum/topics/${topicId}/pin`, {
			isPinned
		});
	},
	setClosed(topicId: number, isClosed: boolean): Promise<{ success: true }> {
		return api.patch<{ success: true }, { isClosed: boolean }>(`/forum/topics/${topicId}/closed`, {
			isClosed
		});
	},
	searchTopics(query: string, page = 1): Promise<ForumTopicListResponse> {
		return api.get<ForumTopicListResponse>('/forum/search', {
			params: {
				q: query,
				page
			}
		});
	},
	getFirstUnread(topicId: number): Promise<ForumFirstUnreadResponse> {
		return api.get<ForumFirstUnreadResponse>(`/forum/topics/${topicId}/first-unread`);
	},
	markTopicRead(topicId: number, messageId: number): Promise<{ success: true }> {
		return api.post<{ success: true }, MarkForumTopicReadInput>(`/forum/topics/${topicId}/read`, {
			messageId
		});
	}
};
