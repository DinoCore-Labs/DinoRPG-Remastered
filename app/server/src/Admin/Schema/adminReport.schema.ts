import { z } from 'zod';

import { ReportStatus } from '../../../../prisma/index.js';

export const adminReportParamsSchema = z.object({
	id: z.coerce.number().int().positive()
});

export const adminReportQuerySchema = z.object({
	page: z.coerce.number().int().positive().optional().default(1)
});

export const updateAdminReportSchema = z.object({
	status: z.nativeEnum(ReportStatus).optional(),
	comment: z.string().nullable().optional(),
	banDuration: z.string().nullable().optional(),
	muteDuration: z.string().nullable().optional()
});

export type UpdateAdminReportBody = z.infer<typeof updateAdminReportSchema>;
