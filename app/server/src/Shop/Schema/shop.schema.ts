import { z } from 'zod';

export const shopDinozIdParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const shopIdParamsSchema = z.object({
	shopId: z.coerce.number().int().positive()
});

export const itinerantDinozIdParamsSchema = z.object({
	dinozId: z.coerce.number().int().positive()
});

export const sellIngredientsBodySchema = z.object({
	ingredients: z
		.array(
			z.object({
				itemId: z.coerce.number().int().positive(),
				quantity: z.coerce.number().int().positive()
			})
		)
		.min(1)
		.max(100)
});
