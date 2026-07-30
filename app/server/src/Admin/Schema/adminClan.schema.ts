import { z } from 'zod';

export const adminClanParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const searchClanQuerySchema = z.object({
	q: z.string().min(2)
});

export const updateClanNameSchema = z.object({
	name: z.string().min(3).max(50)
});

export const updateClanLeaderSchema = z.object({
	newLeaderId: z.string().uuid()
});

export const kickClanMemberSchema = z.object({
	id: z.coerce.number().int().positive(),
	userId: z.string().uuid()
});

export const updateClanTreasureSchema = z.object({
	amount: z.number().int().min(0)
});

export const updateClanIngredientSchema = z.object({
	ingredientId: z.number().int().positive(),
	amountToAddOrRemove: z.number().int() // positive to add, negative to remove
});

export const adminClanPageParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
	pageId: z.coerce.number().int().positive()
});
