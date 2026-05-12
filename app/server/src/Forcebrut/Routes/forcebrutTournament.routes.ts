import type { FastifyInstance } from 'fastify';

import { dinozIdParamsSchema } from '../../Dinoz/Schema/dinoz.schema.js';
import { fightForcebrutOpponent, getForcebrutOpponent } from '../Service/forcebrutTournament.service.js';

export async function forcebrutRoutes(app: FastifyInstance) {
	app.get(
		'/opponent/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Forcebrut'],
				params: dinozIdParamsSchema
			}
		},
		getForcebrutOpponent
	);
	app.post(
		'/fight/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Forcebrut'],
				params: dinozIdParamsSchema
			}
		},
		fightForcebrutOpponent
	);
}
