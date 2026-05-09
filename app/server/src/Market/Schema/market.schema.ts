import { z } from 'zod';

export const marketListParamsSchema = z.object({
	filter: z.enum(['all', 'dinoz', 'items', 'own'])
});

export const marketListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	expired: z.coerce.boolean().optional().default(false),
	onlyMines: z.coerce.boolean().optional().default(false),
	sellerId: z.string().uuid().optional(),
	bidderId: z.string().uuid().optional()
});

export const createMarketOfferBodySchema = z.object({
	dinozId: z.number().int().positive().nullable().optional(),
	total: z.number().int().positive(),
	items: z
		.array(
			z.object({
				itemId: z.number().int().positive(),
				quantity: z.number().int().positive()
			})
		)
		.default([]),
	ingredients: z
		.array(
			z.object({
				ingredientId: z.number().int().positive(),
				quantity: z.number().int().positive()
			})
		)
		.default([])
});

export const offerIdParamsSchema = z.object({
	offerId: z.coerce.number().int().positive()
});

export const bidOfferBodySchema = z.object({
	value: z.number().int().positive()
});
