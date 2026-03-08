import { z } from 'zod';

export const fightParamSchema = z.object({
	id: z.coerce.number().int().positive()
});

export type FightParamInput = z.infer<typeof fightParamSchema>;

export const processFightSchema = z.object({
	dinozId: z.number().int().min(1)
});

export type ProcessFightInput = z.infer<typeof processFightSchema>;

export const processFightResponseSchema = z.object({}).passthrough();

export type ProcessFightResponse = z.infer<typeof processFightResponseSchema>;
