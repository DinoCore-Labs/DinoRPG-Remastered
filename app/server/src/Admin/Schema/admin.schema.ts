import { z } from 'zod';

import { MoneyType, Role } from '../../../../prisma/index.js';

export const adminJobKeyParamsSchema = z.object({
	key: z.string().min(1)
});

export const adminRunJobResponseSchema = z.object({
	ok: z.literal(true)
});

export const adminErrorResponseSchema = z.object({
	message: z.string()
});

export const adminUserParamsSchema = z.object({
	id: z.string().min(1)
});

export const updateAdminUserProfileSchema = z.object({
	role: z.nativeEnum(Role),
	description: z.string().max(1000).nullable(),
	removeAvatar: z.boolean().default(false)
});

export const updateAdminUserWalletSchema = z.object({
	type: z.nativeEnum(MoneyType),
	amount: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserUniqueSkillsSchema = z.object({
	uniqueSkills: z.object({
		leader: z.boolean(),
		engineer: z.boolean(),
		cooker: z.boolean(),
		shopKeeper: z.boolean(),
		merchant: z.boolean(),
		priest: z.boolean(),
		teacher: z.boolean(),
		matelasseur: z.boolean(),
		messie: z.boolean()
	})
});

export const updateAdminUserItemsSchema = z.object({
	id: z.number().int().positive(),
	quantity: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserIngredientsSchema = z.object({
	id: z.number().int().positive(),
	quantity: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});

export const updateAdminUserRewardsSchema = z.object({
	rewardId: z.number().int().positive(),
	operation: z.enum(['add', 'remove'])
});
