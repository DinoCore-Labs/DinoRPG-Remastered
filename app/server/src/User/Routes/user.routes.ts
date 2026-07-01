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
	changeUserPasswordSchema,
	createUserResponseSchema,
	createUserSchema,
	loginResponseSchema,
	loginSchema,
	updateUserProfileResponseSchema,
	updateUserProfileSchema,
	userIdParamSchema,
	userNameParamSchema
} from '../Schema/user.schema.js';
import { changeUserPassword } from '../Service/changeUserPassword.service.js';

export async function userRoutes(app: FastifyInstance) {
	// Routes GET
	// Me infos
	app.get(
		'/me',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Users']
			}
		},
		meUser
	);
	// Me profile
	app.get(
		'/me/profile',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Users']
			}
		},
		getOwnProfileController
	);
	app.patch(
		'/me/password',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Users'],
				body: changeUserPasswordSchema
			}
		},
		changeUserPassword
	);
	// Check name of account creation
	app.get(
		'/check-name/:name',
		{
			schema: {
				tags: ['Users'],
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
				tags: ['Users'],
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
				tags: ['Users'],
				params: userIdParamSchema
			}
		},
		async (req, reply) => {
			const res = await userToolTip(req);
			reply.send(res);
		}
	);
	// Profil public d'un autre joueur
	app.get('/:id/profile', { schema: { tags: ['Users'] } }, getUserProfileController);
	// Routes POST/PUT/PATCH
	app.post(
		'/register',
		{
			schema: {
				tags: ['Users'],
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
				tags: ['Users'],
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
				tags: ['Users'],
				body: updateUserProfileSchema,
				response: {
					200: updateUserProfileResponseSchema
				}
			}
		},
		updateProfileController
	);
	app.post('/me/avatar', { preHandler: [app.authenticate], schema: { tags: ['Users'] } }, uploadAvatarController);
	// Routes DELETE
	app.delete('/logout', { schema: { tags: ['Users'] } }, logoutUser);
}
