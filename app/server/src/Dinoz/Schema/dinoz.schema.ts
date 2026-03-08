import { z } from 'zod';

export const moveDinozSchema = z.object({
	dinozId: z.coerce.number().int().positive(),
	placeId: z.coerce.number().int().positive()
});

export type MoveDinozInput = z.infer<typeof moveDinozSchema>;

export const moveDinozResponseSchema = z.object({
	success: z.literal(true),
	dinozId: z.number().int().positive(),
	placeId: z.number().int().positive()
});

export type MoveDinozResponse = z.infer<typeof moveDinozResponseSchema>;

export const dinozIdParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const dinozFollowParamsSchema = z.object({
	id: z.coerce.number().int().positive(),
	targetId: z.coerce.number().int().positive()
});

export const setDinozNameBodySchema = z.object({
	name: z.string().min(1).max(32)
});

export const setSkillStateBodySchema = z.object({
	skillId: z.coerce.number().int().positive(),
	state: z.boolean()
});
