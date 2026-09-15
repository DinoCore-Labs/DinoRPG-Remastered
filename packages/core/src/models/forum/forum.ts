import { UserRole } from '../user/userRole.js';

export const ForumCategories = ['QUESTIONS', 'GAME', 'CLANS', 'CHAOS'] as const;

export type ForumCategory = (typeof ForumCategories)[number];

export const FORUM_MAX_MESSAGES = 500;
export const FORUM_TOPICS_PER_PAGE = 25;
export const FORUM_MESSAGES_PER_PAGE = 25;
export const FORUM_SEARCH_MIN_LENGTH = 2;
export const FORUM_SEARCH_MAX_LENGTH = 80;

export function isForumCategory(value: unknown): value is ForumCategory {
	return typeof value === 'string' && (ForumCategories as readonly string[]).includes(value);
}

export interface ForumTopicSummary {
	id: number;
	category: ForumCategory;
	title: string;
	isPinned: boolean;
	isClosed: boolean;
	messageCount: number;
	replyCount: number;
	authorId: string | null;
	authorName: string;
	authorRole: UserRole | null;
	createdAt: string;
	lastActivityAt: string;
	isFavorite: boolean;
}

export interface ForumTopicListResponse {
	topics: ForumTopicSummary[];
	page: number;
	pageCount: number;
	total: number;
}

export interface ForumMessageView {
	id: number;
	topicId: number;
	content: string;
	authorId: string | null;
	authorName: string;
	avatarUrl: string | null;
	authorRole: UserRole | null;
	createdAt: string;
	updatedAt: string;
}

export interface ForumTopicViewResponse {
	topic: ForumTopicSummary;
	messages: ForumMessageView[];
	page: number;
	pageCount: number;
	totalMessages: number;
}

export interface CreateForumTopicInput {
	title: string;
	content: string;
}

export interface CreateForumMessageInput {
	content: string;
}

export interface UpdateForumMessageInput {
	content: string;
}

export interface ForumMessageCreatedResponse {
	message: ForumMessageView;
	topic: {
		id: number;
		isClosed: boolean;
		messageCount: number;
	};
}

export interface ToggleForumFavoriteResponse {
	favorite: boolean;
}

export interface UpdateForumPinnedInput {
	isPinned: boolean;
}

export interface UpdateForumClosedInput {
	isClosed: boolean;
}
