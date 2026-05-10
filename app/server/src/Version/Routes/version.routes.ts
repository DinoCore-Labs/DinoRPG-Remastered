import type { FastifyInstance } from 'fastify';

import packageJson from '../../../../../package.json' with { type: 'json' };
import { versionResponseSchema } from '../Schema/version.schema.js';

export async function versionRoutes(app: FastifyInstance) {
	app.get(
		'/version',
		{
			schema: {
				response: {
					200: versionResponseSchema
				}
			}
		},
		async (_request, reply) => {
			reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
			reply.header('Pragma', 'no-cache');
			reply.header('Expires', '0');

			return { version: packageJson.version };
		}
	);
}
