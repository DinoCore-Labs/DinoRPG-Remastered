import { z } from 'zod';

export const threadIdParamsSchema = z.object({
	id: z.string().uuid()
});

export const threadMessagesQuerySchema = z.object({
	page: z.coerce.number().int().min(1).optional()
});

export const createThreadBodySchema = z.object({
	participantIds: z.array(z.string().uuid()).min(1).max(9),
	title: z.string().trim().min(1).max(120).optional(),
	message: z.string().trim().min(1).max(5000)
});

export const answerThreadBodySchema = z.object({
	message: z.string().trim().min(1).max(5000)
});

export type ThreadIdParams = z.infer<typeof threadIdParamsSchema>;
export type ThreadMessagesQuery = z.infer<typeof threadMessagesQuerySchema>;
export type CreateThreadBody = z.infer<typeof createThreadBodySchema>;
export type AnswerThreadBody = z.infer<typeof answerThreadBodySchema>;
