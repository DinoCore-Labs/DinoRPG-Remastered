import type { FastifyInstance } from 'fastify';

import packageJson from '../../../../package.json' with { type: 'json' };

export async function versionRoutes(app: FastifyInstance) {
	app.get('/version', async (_request, reply) => {
		reply.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
		reply.header('Pragma', 'no-cache');
		reply.header('Expires', '0');
		return { version: packageJson.version };
	});
}
