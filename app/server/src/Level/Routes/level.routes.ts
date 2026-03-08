import type { FastifyInstance } from 'fastify';

import { learnableSkillsParamsSchema, learnSkillParamsSchema } from '../Schema/level.schema.js';
import { getLearnableAndUnlockableSkills } from '../Service/getLearnableSkills.service.js';
import { learnSkill } from '../Service/learnSkill.service.js';

export async function levelRoutes(app: FastifyInstance) {
	app.get(
		'/learnableskills/:id/:tryNumber',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Level'],
				params: learnableSkillsParamsSchema
			}
		},
		getLearnableAndUnlockableSkills
	);
	app.post(
		'/learnskill/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Level'],
				params: learnSkillParamsSchema
			}
		},
		learnSkill
	);
}
