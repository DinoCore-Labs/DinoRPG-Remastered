import type { FastifyInstance } from 'fastify';

import { devoreuseGetDefendersHandler } from '../../Dinoz/Service/devoreuse.service.js';

export async function devoreuseRoutes(server: FastifyInstance) {
	server.get('/:placeId', { preHandler: [server.authenticate] }, devoreuseGetDefendersHandler);
}
