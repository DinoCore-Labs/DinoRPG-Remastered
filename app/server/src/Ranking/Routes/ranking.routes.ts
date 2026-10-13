import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

import {
	getClanEventRanking,
	getEventRankingEditions,
	getPlayerEventRanking
} from '../Controller/getEventRanking.controller.js';
import {
	getMonsterHuntRanking,
	getMonsterHuntRankingEditions,
	getMonsterHuntUserRank
} from '../Controller/getMonsterHuntRanking.controller.js';
import { getUserRankingSummary } from '../Controller/getUserPositionRanking.controller.js';
import {
	eventRankingQuerySchema,
	monsterHuntRankingParamsSchema,
	monsterHuntUserRankingParamsSchema,
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
	typedApp.get(
		'/monster-hunt/editions',
		{
			schema: {
				tags: ['Ranking']
			}
		},
		async (_req, reply) => {
			const editions = await getMonsterHuntRankingEditions();
			return reply.send({
				editions
			});
		}
	);
	typedApp.get(
		'/monster-hunt/:huntId/:page',
		{
			schema: {
				tags: ['Ranking'],
				params: monsterHuntRankingParamsSchema
			}
		},
		async (req, reply) => {
			const { huntId, page } = req.params;
			const ranking = await getMonsterHuntRanking(huntId, page, 50);
			if (!ranking) {
				return reply.code(404).send({
					code: 'monsterHunt.notFound',
					message: 'Monster Hunt edition not found'
				});
			}
			return reply.send(ranking);
		}
	);
	typedApp.get(
		'/monster-hunt/:huntId/player/:userId',
		{
			schema: {
				tags: ['Ranking'],
				params: monsterHuntUserRankingParamsSchema
			}
		},
		async (req, reply) => {
			const { huntId, userId } = req.params;
			const ranking = await getMonsterHuntUserRank(huntId, userId);
			return reply.send(ranking);
		}
	);
}
