import type { FastifyInstance } from 'fastify';

import { getLearnableAndUnlockableSkills } from '../Service/getLearnableSkills.service.js';
import { learnSkill } from '../Service/learnSkill.service.js';

export async function levelRoutes(app: FastifyInstance) {
	app.get('/learnablesskills/:id/:tryNumber', { preHandler: app.authenticate }, getLearnableAndUnlockableSkills);
	app.post('/learnskill/:id', { preHandler: app.authenticate }, learnSkill);
}
