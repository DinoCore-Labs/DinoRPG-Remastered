import { z } from 'zod';

export const rankingListParamsSchema = z.object({
	sort: z.string(),
	page: z.coerce.number().int().positive()
});

export type RankingListParams = z.infer<typeof rankingListParamsSchema>;

export const rankingPositionParamsSchema = z.object({
	userId: z.string().uuid()
});

export const eventRankingQuerySchema = z.object({
	edition: z.coerce.number().int().positive().optional()
});

export type EventRankingQuery = z.infer<typeof eventRankingQuerySchema>;
