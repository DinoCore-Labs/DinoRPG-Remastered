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
