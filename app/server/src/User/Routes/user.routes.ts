import { FastifyInstance } from 'fastify';

import { createUser } from '../Controller/createUser.controller.js';
import { getUsers } from '../Controller/getUsers.controller.js';
import { loginUser } from '../Controller/loginUser.controller.js';
import { logoutUser } from '../Controller/logoutUser.controller.js';
import { $ref } from '../Schema/user.schema.js';

export async function userRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: [app.authenticate]
		},
		getUsers
	);

	app.post(
		'/register',
		{
			schema: {
				body: $ref('createUserSchema'),
				response: {
					201: $ref('createUserResponseSchema')
				}
			}
		},
		createUser
	);

	app.post(
		'/login',
		{
			schema: {
				body: $ref('loginSchema'),
				response: {
					201: $ref('loginResponseSchema')
				}
			}
		},
		loginUser
	);

	app.delete('/logout', logoutUser);

	app.log.info('user routes registered');
}
