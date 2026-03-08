import { z } from 'zod';

export const gatherGridParamsSchema = z.object({
	type: z.string(),
	id: z.coerce.number().int().positive()
});

export const gatherParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});
