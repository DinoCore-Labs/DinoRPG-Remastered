import { FORUM_SEARCH_MAX_LENGTH, FORUM_SEARCH_MIN_LENGTH, ForumCategories } from '@dinorpg/core/models/forum/forum.js';
import { z } from 'zod';

export const forumCategoryParamSchema = z.object({
	category: z.enum(ForumCategories)
});

export const forumTopicParamSchema = z.object({
	topicId: z.coerce.number().int().positive()
});

export const forumPageQuerySchema = z.object({
	page: z.coerce.number().int().positive().default(1)
});

export const createForumTopicBodySchema = z.object({
	title: z.string().trim().min(3).max(120),
	content: z.string().trim().min(1).max(10_000)
});

export const createForumMessageBodySchema = z.object({
	content: z.string().trim().min(1).max(10_000)
});

export const updateForumPinnedBodySchema = z.object({
	isPinned: z.boolean()
});

export const updateForumClosedBodySchema = z.object({
	isClosed: z.boolean()
});

export const forumSearchQuerySchema = forumPageQuerySchema.extend({
	q: z.string().trim().min(FORUM_SEARCH_MIN_LENGTH).max(FORUM_SEARCH_MAX_LENGTH)
});

export type CreateForumTopicBody = z.infer<typeof createForumTopicBodySchema>;

export type CreateForumMessageBody = z.infer<typeof createForumMessageBodySchema>;
