import { z } from 'zod';

export const adminJobKeyParamsSchema = z.object({
	key: z.string().min(1)
});

export const adminRunJobResponseSchema = z.object({
	ok: z.literal(true)
});

export const adminErrorResponseSchema = z.object({
	message: z.string()
});
