import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { createUser } from '../controller/user.controller.js';
import { $ref } from '../schema/user.schema.js';

export async function userRoutes(app: FastifyInstance) {
	app.get('/', (req: FastifyRequest, reply: FastifyReply) => {
		reply.send({ message: '/ route hit' });
	});

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
		() => {}
	);

	app.delete('/logout', () => {});

	app.log.info('user routes registered');
}
