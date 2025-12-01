import { FastifyInstance } from 'fastify';

import { checkNameUser } from '../Controller/checkNameUser.controller.js';
import { createUser } from '../Controller/createUser.controller.js';
import { loginUser } from '../Controller/loginUser.controller.js';
import { logoutUser } from '../Controller/logoutUser.controller.js';
import { meUser } from '../Controller/meUser.controller.js';
import { searchUsersByName } from '../Controller/searchUsersByName.controller.js';
import { userToolTip } from '../Controller/toolTipInfosUser.controller.js';
import { $ref } from '../Schema/user.schema.js';

export async function userRoutes(app: FastifyInstance) {
	// Routes GET
	app.get(
		'/me',
		{
			preHandler: [app.authenticate]
		},
		meUser
	);
	app.get('/check-name/:name', checkNameUser);
	app.get('/search/:name', async (req, reply) => {
		const name = (req.params as any).name;
		const users = await searchUsersByName(name);
		reply.send(users);
	});
	app.get('/tooltip/:id', async (req, reply) => {
		const res = await userToolTip(req);
		reply.send(res);
	});
	// Routes POST/PATCH
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
	// Routes DELETE
	app.delete('/logout', logoutUser);

	app.log.info('user routes registered');
}
