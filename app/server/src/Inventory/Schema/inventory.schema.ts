import { z } from 'zod';

export const useItemParamsSchema = z.object({
	dinozId: z.coerce.number().int().positive(),
	itemId: z.coerce.number().int().positive()
});

export const equipItemParamsSchema = z.object({
	dinozId: z.coerce.number().int().positive()
});
