import { FastifyInstance } from 'fastify';

import { checkNameUser } from '../Controller/checkNameUser.controller.js';
import { createUser } from '../Controller/createUser.controller.js';
import { loginUser } from '../Controller/loginUser.controller.js';
import { logoutUser } from '../Controller/logoutUser.controller.js';
import { meUser } from '../Controller/meUser.controller.js';
import { searchUsersByName } from '../Controller/searchUsersByName.controller.js';
import { userToolTip } from '../Controller/toolTipInfosUser.controller.js';
import {
	getOwnProfileController,
	getUserProfileController,
	updateProfileController,
	uploadAvatarController
} from '../Controller/userProfile.controller.js';
import { $userRef } from '../Schema/user.schema.js';

export async function userRoutes(app: FastifyInstance) {
	// Routes GET
	// Me infos
	app.get(
		'/me',
		{
			preHandler: [app.authenticate]
		},
		meUser
	);
	// Me profile
	app.get('/me/profile', { preHandler: [app.authenticate] }, getOwnProfileController);
	// Check name of account creation
	app.get('/check-name/:name', checkNameUser);
	// Search name of ranking
	app.get('/search/:name', async (req, reply) => {
		const name = (req.params as any).name;
		const users = await searchUsersByName(name);
		reply.send(users);
	});
	// UserCard
	app.get('/tooltip/:id', async (req, reply) => {
		const res = await userToolTip(req);
		reply.send(res);
	});
	// Profil public d'un autre joueur
	app.get('/:id/profile', getUserProfileController);
	// Routes POST/PUT/PATCH
	app.post(
		'/register',
		{
			schema: {
				body: $userRef('createUserSchema'),
				response: {
					201: $userRef('createUserResponseSchema')
				}
			}
		},
		createUser
	);
	app.post(
		'/login',
		{
			schema: {
				body: $userRef('loginSchema'),
				response: {
					201: $userRef('loginResponseSchema')
				}
			}
		},
		loginUser
	);
	app.put('/me/profile', { preHandler: [app.authenticate] }, updateProfileController);
	app.post('/me/avatar', { preHandler: [app.authenticate] }, uploadAvatarController);
	// Routes DELETE
	app.delete('/logout', logoutUser);

	app.log.info('user routes registered');
}
