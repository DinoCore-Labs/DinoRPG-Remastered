import type { FastifyInstance } from 'fastify';

import {
	dinozFollowParamsSchema,
	dinozIdParamsSchema,
	moveDinozResponseSchema,
	moveDinozSchema,
	setDinozNameBodySchema,
	setSkillStateBodySchema
} from '../Schema/dinoz.schema.js';
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
import { stopResting } from '../Service/stopRestingDinoz.service.js';
import { unfollowDinoz } from '../Service/unfollowDinoz.service.js';
import { useIrma } from '../Service/useIrma.service.js';

export async function dinozRoutes(app: FastifyInstance) {
	// Fiche
	app.get(
		'/fiche/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		getDinozFiche
	);
	app.put(
		'/setname/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema,
				body: setDinozNameBodySchema
			}
		},
		setDinozName
	);
	// Skills
	app.get(
		'skills/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		getDinozSkillHandler
	);
	app.patch(
		'setskillstate/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema,
				body: setSkillStateBodySchema
			}
		},
		setSkillStateHandler
	);
	// Actions
	app.post(
		'/:id/irma',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		useIrma
	);
	app.put(
		'/move',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				body: moveDinozSchema
			}
		},
		moveDinozHandler
	);
	app.put(
		'/resurrect/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		resurrectDinoz
	);
	app.post(
		'/reincarnate/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		reincarnate
	);
	app.post(
		'/:id/follow/:targetId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozFollowParamsSchema
			}
		},
		followDinoz
	);
	app.post(
		'/:id/unfollow',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		unfollowDinoz
	);
	app.post(
		'/:id/disband',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		disband
	);
	app.post(
		'/:id/change/:targetId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozFollowParamsSchema
			}
		},
		changeLeaderDinozGroup
	);
	app.post(
		'/:id/rest',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		startResting
	);
	app.post(
		'/:id/stop-rest',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Dinoz'],
				params: dinozIdParamsSchema
			}
		},
		stopResting
	);
}
