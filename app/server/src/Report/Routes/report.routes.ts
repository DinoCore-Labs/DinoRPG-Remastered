import type { FastifyInstance } from 'fastify';

import { createReportBodySchema } from '../Schema/report.schema.js';
import { createReportHandler } from '../Service/report.service.js';

export async function reportRoutes(app: FastifyInstance) {
	app.post(
		'/',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Report'],
				body: createReportBodySchema
			}
		},
		createReportHandler
	);
}
