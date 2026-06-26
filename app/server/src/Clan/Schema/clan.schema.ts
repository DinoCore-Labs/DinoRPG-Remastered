import { Language } from '@dinorpg/core/models/config/language.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { z } from 'zod';

export const createClanSchema = z.object({
	name: z
		.string()
		.min(3)
		.max(25)
		.regex(/^[a-zA-Z0-9 _-]+$/),
	languages: z.array(z.nativeEnum(Language)).optional(),
	description: z.string().max(500).optional()
});

export const clanIdParamSchema = z.object({
	clanId: z.coerce.number().int().positive()
});

export const treasureIngredientSchema = z.object({
	ingredientId: z.number(),
	quantity: z.number()
});

export const clanLiteResponseSchema = z.object({
	id: z.number(),
	name: z.string(),
	treasureValue: z.number(),
	creationDate: z.date().or(z.string()),
	leaderId: z.number(),
	languages: z.array(z.nativeEnum(Language)),
	members: z.array(
		z.object({
			id: z.number()
		})
	),
	leader: z.object({
		id: z.number(),
		name: z.string()
	}),
	banner: z.string().url().optional(),
	totalScore: z.number().optional(),
	ingredients: z.array(treasureIngredientSchema).optional()
});

export const updateClanLangsSchema = z.object({
	languages: z.array(z.nativeEnum(Language))
});

export const updateClanLangsResponseSchema = z.object({
	success: z.literal(true),
	languages: z.array(z.nativeEnum(Language))
});

export const clanRightParamSchema = z.object({
	right: z.nativeEnum(ClanMemberRight)
});

export const pageIdParamSchema = z.object({
	pageId: z.coerce.number().int().positive()
});

export const createClanPageSchema = z.object({
	name: z.string().min(3).max(50),
	content: z.string().max(5000),
	isPublic: z.boolean(),
	clanId: z.coerce.number().int().positive()
});

export const clanPageResponseSchema = z.object({
	pageId: z.coerce.number().int().positive(),
	name: z.string().min(3).max(50),
	home: z.boolean(),
	content: z.string().max(5000),
	isPublic: z.boolean(),
	clanId: z.coerce.number().int().positive()
});

export const updateClanPageSchema = z.object({
	name: z.string().min(3).max(50),
	content: z.string().max(5000),
	isPublic: z.boolean()
});

export const clanHistoryPageSchema = z.object({
	page: z.coerce.number().int().positive()
});

export const clanMemberIdSchema = z.object({
	memberId: z.coerce.number().int().positive()
});

export const clanMemberLiteSchema = z.object({
	id: z.coerce.number().int().positive(),
	nickname: z.string().nullable(),
	rights: z.array(z.nativeEnum(ClanMemberRight))
});

export const updateClanMemberRequestBodySchema = z.object({
	clanMember: clanMemberLiteSchema
});

export const clanMemberSchema = z.object({
	id: z.number().int().positive(),
	clanId: z.number().int().positive(),
	dateJoin: z.coerce.date(),
	nickname: z.string().nullable(),
	rights: z.array(z.nativeEnum(ClanMemberRight)),
	donation: z.number().nonnegative(),
	userId: z.string()
});

export const joinRequestIdParamSchema = z.object({
	requestId: z.coerce.number().int().positive()
});

export const searchClansSchema = z.object({
	name: z.string().min(1),
	page: z.coerce.number().int().positive()
});

export const pageParamSchema = z.object({
	page: z.coerce.number().int().positive()
});

export const giveIngredientBodySchema = z.object({
	ingredients: z.array(
		z.object({
			itemId: z.number().int().positive(),
			quantity: z.number().int().positive()
		})
	)
});

export const createClanMessageSchema = z.object({
	content: z.string().min(1).max(5000)
});
export const messageIdParamSchema = z.object({
	messageId: z.coerce.number().int().positive()
});
export const clanMessagesQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional()
});
