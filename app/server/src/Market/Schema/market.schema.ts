import { z } from 'zod';

const queryBooleanSchema = z.preprocess(value => {
	if (value === undefined) {
		return false;
	}

	if (typeof value === 'boolean') {
		return value;
	}

	if (typeof value === 'string') {
		return value === 'true' || value === '1';
	}

	return false;
}, z.boolean());

export const marketListParamsSchema = z.object({
	filter: z.enum(['all', 'dinoz', 'items', 'own'])
});

export const marketListQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	expired: queryBooleanSchema,
	onlyMines: queryBooleanSchema,
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
