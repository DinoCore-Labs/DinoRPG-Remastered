import { Language } from '@dinorpg/core/models/config/language.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';
import { z } from 'zod';

export const newsTypeSchema = z.enum(NewsType);
export const languageSchema = z.enum(Language);

export const newsIdParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const newsPageParamsSchema = z.object({
	page: z.coerce.number().int().positive()
});

export const pollVoteParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
	optionId: z.coerce.number().int().positive()
});

export const newsTranslationBodySchema = z.object({
	lang: languageSchema,
	title: z.string().trim().min(1).max(255),
	excerpt: z.string().trim().max(255).nullable().optional(),
	content: z.string().trim().min(1)
});

export const pollOptionTranslationBodySchema = z.object({
	lang: languageSchema,
	label: z.string().trim().min(1).max(255)
});

export const createPollOptionBodySchema = z.object({
	sortOrder: z.number().int().min(0).optional(),
	translations: z.array(pollOptionTranslationBodySchema).min(1)
});

export const createPollBodySchema = z.object({
	endAt: z.coerce.date(),
	isActive: z.boolean().optional(),
	options: z.array(createPollOptionBodySchema).min(2)
});

export const createNewsBodySchema = z.object({
	slug: z
		.string()
		.trim()
		.min(1)
		.max(255)
		.regex(/^[a-z0-9]+(?:-[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug format'),
	type: newsTypeSchema.default(NewsType.UPDATE),
	isPublished: z.boolean().optional(),
	publishedAt: z.coerce.date().nullable().optional(),
	translations: z.array(newsTranslationBodySchema).min(1),
	poll: createPollBodySchema.optional()
});

export const updateNewsBodySchema = z
	.object({
		slug: z
			.string()
			.trim()
			.min(1)
			.max(255)
			.regex(/^[a-z0-9]+(?:-[a-z0-9-]*[a-z0-9])?$/, 'Invalid slug format')
			.optional(),
		type: newsTypeSchema.optional(),
		isPublished: z.boolean().optional(),
		publishedAt: z.coerce.date().nullable().optional(),
		translations: z.array(newsTranslationBodySchema).min(1).optional(),
		removeImage: z.boolean().optional(),
		poll: createPollBodySchema.optional()
	})
	.refine(
		data =>
			data.slug !== undefined ||
			data.type !== undefined ||
			data.isPublished !== undefined ||
			data.publishedAt !== undefined ||
			data.translations !== undefined ||
			data.removeImage !== undefined ||
			data.poll !== undefined,
		{ message: 'At least one field must be provided' }
	);

export const toggleNewsLikeResponseSchema = z.object({
	newsId: z.number().int().positive(),
	likes: z.number().int().min(0),
	likedByMe: z.boolean()
});

export const votePollResponseSchema = z.object({
	success: z.boolean()
});

export type CreateNewsBody = z.infer<typeof createNewsBodySchema>;
export type UpdateNewsBody = z.infer<typeof updateNewsBodySchema>;
export type CreatePollBody = z.infer<typeof createPollBodySchema>;
