import { z } from 'zod';

export const dialogQuerySchema = z.object({
	dinozId: z.coerce.number().int().positive()
});

export const dialogIdParamsSchema = z.object({
	dialogId: z.string().min(1)
});

export const dialogLinkParamsSchema = z.object({
	dialogId: z.string().min(1),
	linkId: z.string().min(1)
});

export const dialogPhaseBodySchema = z.object({
	phaseId: z.string().min(1)
});
