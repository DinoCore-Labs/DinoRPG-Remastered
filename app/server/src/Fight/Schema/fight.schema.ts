import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

// --- Request body ---
export const processFightSchema = z.object({
	dinozId: z.number().int().min(1)
});

export type ProcessFightInput = z.infer<typeof processFightSchema>;

// --- Response ---
// Option A (simple / pratique) : on laisse flexible tant que tu n’as pas figé le DTO.
export const processFightResponseSchema = z.unknown();
export type ProcessFightResponse = z.infer<typeof processFightResponseSchema>;

// Option B (un peu mieux) : au moins un objet (si tu sais que tu reply un objet)
// export const processFightResponseSchema = z.object({}).passthrough();

export const { schemas: fightSchemas, $ref: $fightRef } = buildJsonSchemas(
	{
		processFightSchema,
		processFightResponseSchema
	},
	{
		$id: 'fightSchemas'
	}
);
