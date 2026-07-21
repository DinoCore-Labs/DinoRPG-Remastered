import type { FastifyInstance } from 'fastify';

import { getMaintenanceMode } from '../Controller/maintenance.controller.js';
import { maintenanceStatusSchema } from '../Schema/maintenance.schema.js';

export async function maintenanceRoutes(server: FastifyInstance) {
	server.get(
		'/',
		{
			schema: {
				response: {
					200: maintenanceStatusSchema
				}
			}
		},
		async () => {
			return getMaintenanceMode();
		}
	);
}
