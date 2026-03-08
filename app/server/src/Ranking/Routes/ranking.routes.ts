import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import { getUserRankingSummary } from '../Controller/getUserPositionRanking.controller.js';
import { rankingListParamsSchema, rankingPositionParamsSchema } from '../Schema/ranking.schema.js';
import { getRanking } from '../Service/ranking.service.js';

export async function rankingRoutes(app: FastifyInstance) {
	const typedApp = app.withTypeProvider<ZodTypeProvider>();
	typedApp.get(
		'/list/:sort/:page',
		{
			schema: {
				tags: ['Ranking'],
				params: rankingListParamsSchema
			}
		},
		async (req, reply) => {
			const res = await getRanking(req.params);
			reply.send(res);
		}
	);
	typedApp.get(
		'/position/:userId',
		{
			schema: {
				tags: ['Ranking'],
				params: rankingPositionParamsSchema
			}
		},
		async (req, reply) => {
			const { userId } = req.params;
			const data = await getUserRankingSummary(userId);
			return reply.send({ data });
		}
	);
}
