import { FastifyInstance } from 'fastify';

import { buyDinoz } from '../Service/buyDinoz.service.js';
import { getDinozFromDinozShop } from '../Service/getDinozFromDinozShop.service.js';

export async function shopRoutes(app: FastifyInstance) {
	app.get('/dinoz', { preHandler: app.authenticate }, getDinozFromDinozShop);
	app.post(
		'/dinoz/buydinoz/:id',
		{
			preHandler: app.authenticate,
			schema: {
				params: {
					type: 'object',
					required: ['id'],
					properties: {
						id: {
							type: 'number'
						}
					}
				}
			}
		},
		buyDinoz
	);
}
