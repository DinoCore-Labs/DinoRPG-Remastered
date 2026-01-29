import { FastifyInstance } from 'fastify';

import { getDinozFromDinozShop } from '../Service/getDinozFromDinozShop.service.js';

export async function shopRoutes(app: FastifyInstance) {
	app.get('/dinoz', { preHandler: app.authenticate }, getDinozFromDinozShop);
}
