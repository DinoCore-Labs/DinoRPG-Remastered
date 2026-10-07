import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import {
	getClanEventRanking,
	getEventRankingEditions,
	getPlayerEventRanking
} from '../Controller/getEventRanking.controller.js';
import { getUserRankingSummary } from '../Controller/getUserPositionRanking.controller.js';
import {
	eventRankingQuerySchema,
	rankingListParamsSchema,
	rankingPositionParamsSchema
} from '../Schema/ranking.schema.js';
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
		'/clan/:sort/:page',
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
			return reply.send(data);
		}
	);
	typedApp.get(
		'/event/players/:eventId/:page',
		{
			schema: {
				tags: ['Ranking'],
				querystring: eventRankingQuerySchema
			}
		},
		async (req, reply) => {
			const { eventId, page } = req.params as {
				eventId: string;
				page: string;
			};
			const { edition } = req.query;
			const res = await getPlayerEventRanking(eventId, parseInt(page, 10) || 1, 50, edition);
			reply.send(res);
		}
	);
	typedApp.get(
		'/event/clans/:eventId/:page',
		{
			schema: {
				tags: ['Ranking'],
				querystring: eventRankingQuerySchema
			}
		},
		async (req, reply) => {
			const { eventId, page } = req.params as {
				eventId: string;
				page: string;
			};
			const { edition } = req.query;
			const res = await getClanEventRanking(eventId, parseInt(page, 10) || 1, 50, edition);
			reply.send(res);
		}
	);
	typedApp.get(
		'/event/:eventId/editions',
		{
			schema: {
				tags: ['Ranking']
			}
		},
		async (req, reply) => {
			const { eventId } = req.params as {
				eventId: string;
			};
			const editions = await getEventRankingEditions(eventId);
			reply.send({
				eventId,
				editions
			});
		}
	);
}
