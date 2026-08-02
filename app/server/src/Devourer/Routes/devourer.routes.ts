import type { FastifyInstance } from 'fastify';

import { devourerGetDefendersHandler } from '../../Dinoz/Service/devourer.service.js';

export async function devourerRoutes(server: FastifyInstance) {
	server.get('/:placeId', { preHandler: [server.authenticate] }, devourerGetDefendersHandler);
}
