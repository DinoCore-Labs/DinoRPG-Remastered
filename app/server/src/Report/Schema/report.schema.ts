import { z } from 'zod';

export const createReportBodySchema = z
	.object({
		reason: z.string().min(1, 'Reason is required').max(255),
		comment: z.string().max(1000).optional(),
		reportedUserId: z.string().uuid().optional(),
		reportedDinozId: z.number().int().positive().optional(),
		reportedClanId: z.number().int().positive().optional(),
		reportedForumMessageId: z.number().int().positive().optional()
	})
	.refine(
		data =>
			[data.reportedUserId, data.reportedDinozId, data.reportedClanId, data.reportedForumMessageId].filter(
				value => value !== undefined
			).length === 1,
		{
			message: 'Exactly one report target must be specified'
		}
	);

export type CreateReportBody = z.infer<typeof createReportBodySchema>;
