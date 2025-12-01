import { FastifyInstance } from 'fastify';

import { getMyRanking, getRanking } from '../Controller/ranking.controller.js';

export async function rankingRoutes(app: FastifyInstance) {
	app.get<{
		Params: { sort: string; page: string };
	}>('/:sort/:page', async (req, reply) => {
		const res = await getRanking(req);
		reply.send(res);
	});

	app.get('/me', { preHandler: [app.authenticate] }, async (req, reply) => {
		const res = await getMyRanking(req);
		reply.send(res);
	});
}
