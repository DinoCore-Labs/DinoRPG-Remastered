import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { devourerGetDefendersHandler, devourerGetHistoryHandler } from '../../Dinoz/Service/devourer.service.js';

export async function devourerRoutes(server: FastifyInstance) {
	server.get('/:placeId', { preHandler: [server.authenticate] }, devourerGetDefendersHandler);
	server.get('/:placeId/history', { preHandler: [server.authenticate] }, devourerGetHistoryHandler);
}
