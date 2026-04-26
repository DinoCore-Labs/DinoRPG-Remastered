import { FastifyInstance } from 'fastify';

import { dinozIdParamsSchema } from '../../Dinoz/Schema/dinoz.schema.js';
import { trainingCenterBodySchema } from '../Schema/trainingCenter.schema.js';
import { startTrainingCenter } from '../Service/trainingCenter.service.js';

export async function trainingCenterRoutes(app: FastifyInstance) {
	app.post(
		'/:id/training-center/start',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['CEF'],
				params: dinozIdParamsSchema,
				body: trainingCenterBodySchema
			}
		},
		startTrainingCenter
	);
}
