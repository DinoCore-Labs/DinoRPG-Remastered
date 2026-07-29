import { z } from 'zod';

export const createReportBodySchema = z
	.object({
		reason: z.string().min(1, 'Reason is required').max(255),
		comment: z.string().max(1000).optional(),
		reportedUserId: z.string().uuid().optional(),
		reportedDinozId: z.number().int().optional(),
		reportedClanId: z.number().int().optional()
	})
	.refine(
		data => (data.reportedUserId ? 1 : 0) + (data.reportedDinozId ? 1 : 0) + (data.reportedClanId ? 1 : 0) === 1,
		{
			message: 'Exactement une cible doit être spécifiée (Joueur, Dinoz ou Clan)'
		}
	);

export type CreateReportBody = z.infer<typeof createReportBodySchema>;
