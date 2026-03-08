import { z } from 'zod';

export const processFightSchema = z.object({
	dinozId: z.number().int().min(1)
});

export type ProcessFightInput = z.infer<typeof processFightSchema>;

export const processFightResponseSchema = z.object({}).passthrough();

export type ProcessFightResponse = z.infer<typeof processFightResponseSchema>;
