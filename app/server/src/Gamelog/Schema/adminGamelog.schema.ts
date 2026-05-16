import { z } from 'zod';

import { GameLogRetention, GameLogType } from '../../../../prisma/index.js';

export const adminGameLogListQuerySchema = z.object({
	type: z.nativeEnum(GameLogType).optional(),
	retention: z.nativeEnum(GameLogRetention).optional(),
	userId: z.string().uuid().optional(),
	dinozId: z.coerce.number().int().positive().optional(),
	actorUserId: z.string().uuid().optional(),
	from: z.string().datetime().optional(),
	to: z.string().datetime().optional(),
	take: z.coerce.number().int().min(1).max(200).default(50),
	skip: z.coerce.number().int().min(0).default(0)
});

export const adminGameLogHourlyQuerySchema = z.object({
	type: z.nativeEnum(GameLogType),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const adminGameLogDailyQuerySchema = z.object({
	type: z.nativeEnum(GameLogType),
	from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export const adminGameLogSummaryQuerySchema = z.object({
	from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

export type AdminGameLogListQuery = z.infer<typeof adminGameLogListQuerySchema>;
export type AdminGameLogHourlyQuery = z.infer<typeof adminGameLogHourlyQuerySchema>;
export type AdminGameLogDailyQuery = z.infer<typeof adminGameLogDailyQuerySchema>;
export type AdminGameLogSummaryQuery = z.infer<typeof adminGameLogSummaryQuerySchema>;
