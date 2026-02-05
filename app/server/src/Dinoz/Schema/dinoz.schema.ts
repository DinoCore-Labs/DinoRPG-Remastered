import { buildJsonSchemas } from 'fastify-zod';
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

export const { schemas: moveSchemas, $ref } = buildJsonSchemas({
	moveDinozSchema,
	moveDinozResponseSchema
});
