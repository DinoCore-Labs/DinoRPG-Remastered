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
import {
	createUserResponseSchema,
	createUserSchema,
	loginResponseSchema,
	loginSchema,
	updateUserProfileResponseSchema,
	updateUserProfileSchema,
	userIdParamSchema,
	userNameParamSchema
} from '../Schema/user.schema.js';

export async function userRoutes(app: FastifyInstance) {
	console.log({
		createUserSchema,
		createUserResponseSchema,
		loginSchema,
		loginResponseSchema,
		updateUserProfileSchema,
		updateUserProfileResponseSchema
	});
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
	app.get(
		'/check-name/:name',
		{
			schema: {
				params: userNameParamSchema
			}
		},
		checkNameUser
	);
	// Search name of ranking
	app.get(
		'/search/:name',
		{
			schema: {
				params: userNameParamSchema
			}
		},
		async (req, reply) => {
			const name = (req.params as any).name;
			const users = await searchUsersByName(name);
			reply.send(users);
		}
	);
	// UserCard
	app.get(
		'/tooltip/:id',
		{
			schema: {
				params: userIdParamSchema
			}
		},
		async (req, reply) => {
			const res = await userToolTip(req);
			reply.send(res);
		}
	);
	// Profil public d'un autre joueur
	app.get('/:id/profile', getUserProfileController);
	// Routes POST/PUT/PATCH
	app.post(
		'/register',
		{
			schema: {
				body: createUserSchema,
				response: {
					201: createUserResponseSchema
				}
			}
		},
		createUser
	);
	app.post(
		'/login',
		{
			schema: {
				body: loginSchema,
				response: {
					201: loginResponseSchema
				}
			}
		},
		loginUser
	);
	app.put(
		'/me/profile',
		{
			preHandler: [app.authenticate],
			schema: {
				body: updateUserProfileSchema,
				response: {
					200: updateUserProfileResponseSchema
				}
			}
		},
		updateProfileController
	);
	app.post('/me/avatar', { preHandler: [app.authenticate] }, uploadAvatarController);
	// Routes DELETE
	app.delete('/logout', logoutUser);

	app.log.info('user routes registered');
}
