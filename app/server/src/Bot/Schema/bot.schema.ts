import { z } from 'zod';

import { BotStrategy } from '../../../../prisma/index.js';

export const createBotBodySchema = z
	.object({
		name: z.string().min(3).max(20),
		strategy: z.nativeEnum(BotStrategy).default(BotStrategy.BALANCED),
		minDelaySeconds: z.number().int().min(10).max(86_400).default(60),
		maxDelaySeconds: z.number().int().min(10).max(86_400).default(600)
	})
	.refine(data => data.maxDelaySeconds >= data.minDelaySeconds, {
		message: 'maxDelaySeconds must be greater than or equal to minDelaySeconds',
		path: ['maxDelaySeconds']
	});

export type CreateBotBody = z.infer<typeof createBotBodySchema>;

export const botIdParamsSchema = z.object({
	id: z.string().uuid()
});

export const updateBotBodySchema = z
	.object({
		enabled: z.boolean().optional(),
		strategy: z.nativeEnum(BotStrategy).optional(),
		minDelaySeconds: z.number().int().min(10).max(86_400).optional(),
		maxDelaySeconds: z.number().int().min(10).max(86_400).optional()
	})
	.refine(
		data =>
			data.minDelaySeconds === undefined ||
			data.maxDelaySeconds === undefined ||
			data.maxDelaySeconds >= data.minDelaySeconds,
		{
			message: 'maxDelaySeconds must be greater than or equal to minDelaySeconds',
			path: ['maxDelaySeconds']
		}
	);

export type UpdateBotBody = z.infer<typeof updateBotBodySchema>;
