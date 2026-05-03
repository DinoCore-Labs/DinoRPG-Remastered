import type { FastifyInstance } from 'fastify';

import packageJson from '../../../../package.json' with { type: 'json' };

export async function versionRoutes(app: FastifyInstance) {
	app.get('/version', async () => {
		return {
			version: packageJson.version
		};
	});
}
