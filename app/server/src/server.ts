import fCookie from '@fastify/cookie';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

//import swagger from 'fastify-swagger';
//import { withRefResolver } from 'fastify-zod';
import { version } from '../package.json';
import { userRoutes } from './User/Routes/user.routes.js';
import { userSchemas } from './User/Schema/user.schema.js';

function buildServer() {
	const server = Fastify({
		logger: true
	});

	//jwt
	server.register(fjwt, {
		secret: 'ndkandnan78duy9sau87dbndsa89u7dsy789adb'
	});
	// authentication
	server.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
		const token = req.cookies.access_token;

		if (!token) {
			return reply.status(401).send({ message: 'Authentication required' });
		}
		// here decoded will be a different type by default but we want it to be of user-payload type
		const decoded = req.jwt.verify<FastifyJWT['user']>(token);
		req.user = decoded;
	});

	server.get('/healthcheck', async function () {
		return { status: 'OK' };
	});

	server.addHook('preHandler', (req, reply, next) => {
		req.jwt = server.jwt;
		return next();
	});
	//cookies
	server.register(fCookie, {
		secret: 'some-secret-key',
		hook: 'preHandler'
	});

	// register schemas
	for (const schema of [...userSchemas]) {
		server.addSchema(schema);
	}

	/*server.register(
		swagger,
		withRefResolver({
			routePrefix: '/docs',
			exposeRoute: true,
			staticCSP: true,
			openapi: {
				info: {
					title: 'Fastify API',
					description: 'API for some products',
					version
				}
			}
		})
	);*/

	server.register(userRoutes, { prefix: 'api/users' });

	return server;
}

export default buildServer;
