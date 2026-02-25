import type { FastifyInstance } from 'fastify';

import { changeLeaderDinozGroup } from '../Service/changeLeaderDinozGroup.service.js';
import { disband } from '../Service/disbandDinozTeam.service.js';
import { followDinoz } from '../Service/followDinoz.service.js';
import { getDinozFiche } from '../Service/getDinozFiche.service.js';
import { getDinozSkillHandler } from '../Service/getDinozSkill.service.js';
import { moveDinozHandler } from '../Service/moveDinoz.service.js';
import { reincarnate } from '../Service/reincarnateDinoz.service.js';
import { startResting } from '../Service/restDinoz.service.js';
import { resurrectDinoz } from '../Service/resurrectDinoz.service.js';
import { setDinozName } from '../Service/setDinozName.service.js';
import { setSkillStateHandler } from '../Service/setSkillState.service.js';
import { unfollowDinoz } from '../Service/unfollowDinoz.service.js';
import { useIrma } from '../Service/useIrma.service.js';

export async function dinozRoutes(app: FastifyInstance) {
	// Fiche
	app.get('/fiche/:id', { preHandler: app.authenticate }, getDinozFiche);
	app.put('/setname/:id', { preHandler: app.authenticate }, setDinozName);
	// Skills
	app.get('skills/:id', { preHandler: app.authenticate }, getDinozSkillHandler);
	app.patch('setskillstate/:id', { preHandler: app.authenticate }, setSkillStateHandler);
	// Actions
	app.post('/:id/irma', { preHandler: app.authenticate }, useIrma);
	app.put('/move', { preHandler: app.authenticate }, moveDinozHandler);
	app.put('/resurrect/:id', { preHandler: app.authenticate }, resurrectDinoz);
	app.post('/reincarnate/:id', { preHandler: app.authenticate }, reincarnate);
	app.post('/:id/follow/:targetId', { preHandler: app.authenticate }, followDinoz);
	app.post('/:id/unfollow', { preHandler: app.authenticate }, unfollowDinoz);
	app.post('/:id/disband', { preHandler: app.authenticate }, disband);
	app.post('/:id/change/:targetId', { preHandler: app.authenticate }, changeLeaderDinozGroup);
	app.post('/:id/rest', { preHandler: app.authenticate }, startResting);
}
