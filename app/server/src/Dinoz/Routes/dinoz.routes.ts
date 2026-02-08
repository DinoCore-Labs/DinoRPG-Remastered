import type { FastifyInstance } from 'fastify';

import { getDinozFiche } from '../Service/getDinozFiche.service.js';
import { getDinozSkillHandler } from '../Service/getDinozSkill.service.js';
import { moveDinozHandler } from '../Service/moveDinoz.service.js';
import { setDinozName } from '../Service/setDinozName.service.js';
import { setSkillStateHandler } from '../Service/setSkillState.service.js';
import { useIrma } from '../Service/useIrma.service.js';

export async function dinozRoutes(app: FastifyInstance) {
	app.get('/fiche/:id', { preHandler: app.authenticate }, getDinozFiche);
	app.put('/setname/:id', { preHandler: app.authenticate }, setDinozName);

	app.get('skills/:id', { preHandler: app.authenticate }, getDinozSkillHandler);
	app.patch('setskillstate/:id', { preHandler: app.authenticate }, setSkillStateHandler);

	app.post('/:id/irma', { preHandler: app.authenticate }, useIrma);
	app.put('/move', { preHandler: app.authenticate }, moveDinozHandler);
}
