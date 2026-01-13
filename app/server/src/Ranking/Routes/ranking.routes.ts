import { FastifyInstance } from 'fastify';

import { getRanking } from '../Controller/ranking.controller.js';
import { getUserRankingSummary } from '../Service/getUserPositionRanking.service.js';

export async function rankingRoutes(app: FastifyInstance) {
	app.get<{
		Params: { sort: string; page: string };
	}>('/list/:sort/:page', async (req, reply) => {
		const res = await getRanking(req);
		reply.send(res);
	});
	app.get('/position/:userId', async (req, reply) => {
		const { userId } = req.params as { userId?: string };

		if (!userId) return reply.code(400).send({ message: 'Invalid userId' });

		const data = await getUserRankingSummary(userId);
		return reply.send({ data });
	});
}
