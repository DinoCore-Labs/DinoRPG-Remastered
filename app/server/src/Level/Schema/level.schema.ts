import { z } from 'zod';

export const learnableSkillsParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
	tryNumber: z.coerce.number().int().min(0)
});

export const learnSkillParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});
