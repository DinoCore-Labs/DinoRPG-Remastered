import type { FastifyInstance } from 'fastify';

import { getDinozFiche } from '../Service/getDinozFiche.service.js';
import { setDinozName } from '../Service/setDinozName.service.js';

export async function dinozRoutes(app: FastifyInstance) {
	app.get('/fiche/:id', { preHandler: app.authenticate }, getDinozFiche);
	app.put('/setname/:id', { preHandler: app.authenticate }, setDinozName);
}
