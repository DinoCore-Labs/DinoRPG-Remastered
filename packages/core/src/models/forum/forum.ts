import { UserRole } from '../user/userRole.js';

export const ForumCategories = ['QUESTIONS', 'GAME', 'CLANS', 'CHAOS'] as const;

export type ForumCategory = (typeof ForumCategories)[number];

export const FORUM_MAX_MESSAGES = 500;
export const FORUM_TOPICS_PER_PAGE = 25;
export const FORUM_MESSAGES_PER_PAGE = 25;
export const FORUM_SEARCH_MIN_LENGTH = 2;
export const FORUM_SEARCH_MAX_LENGTH = 80;
export const FORUM_TOPIC_LANGUAGE_PREFIXES = ['[FR]', '[EN]', '[ES]', '[DE]'] as const;

export function hasForumTopicLanguagePrefix(title: string): boolean {
	const trimmedTitle = title.trim();
	return FORUM_TOPIC_LANGUAGE_PREFIXES.some(
		prefix => trimmedTitle.startsWith(`${prefix} `) && trimmedTitle.length > prefix.length + 1
	);
}

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
	hasUnreadMessages: boolean;
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
	isDeleted: boolean;
	deletedAt: string | null;
	deletionKind: ForumMessageDeletionKind | null;
	/*
	 * Renvoyé uniquement aux modérateurs.
	 */
	deletionReason: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ForumTopicViewResponse {
	topic: ForumTopicSummary;
	messages: ForumMessageView[];
	isSubscribed: boolean;
	page: number;
	pageCount: number;
	totalMessages: number;
}

export interface ToggleForumSubscriptionResponse {
	subscribed: boolean;
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

export interface DeleteForumMessageResponse {
	success: true;
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

export interface ForumFirstUnreadResponse {
	messageId: number | null;
	page: number | null;
}

export interface MarkForumTopicReadInput {
	messageId: number;
}

export const ForumMessageDeletionKinds = ['AUTHOR', 'MODERATION'] as const;

export type ForumMessageDeletionKind = (typeof ForumMessageDeletionKinds)[number];

export const ForumModerationActionTypes = [
	'MESSAGE_DELETE',
	'MESSAGE_RESTORE',
	'TOPIC_PIN',
	'TOPIC_UNPIN',
	'TOPIC_CLOSE',
	'TOPIC_REOPEN'
] as const;

export type ForumModerationActionType = (typeof ForumModerationActionTypes)[number];

export interface UpdateForumMessageModerationInput {
	isDeleted: boolean;
	reason?: string;
}

export interface ForumModerationActionView {
	id: number;
	topicId: number;
	messageId: number | null;
	actorName: string;
	action: ForumModerationActionType;
	reason: string | null;
	createdAt: string;
}

export interface ForumModerationHistoryResponse {
	actions: ForumModerationActionView[];
}
