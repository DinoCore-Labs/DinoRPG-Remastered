import fCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import dotenv from 'dotenv';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import { withRefResolver } from 'fastify-zod';

import { userRoutes } from './User/Routes/user.routes.js';
import { userSchemas } from './User/Schema/user.schema.js';
import version from './utils/version.js';

dotenv.config();

function buildServer() {
	const server = Fastify({
		logger: true
	});

	///------------------------------------------------------
	// 1. CORS — doit être en tout premier pour les cookies
	//------------------------------------------------------
	server.register(cors, {
		origin: 'http://localhost:8080', // ton FRONT
		credentials: true // indispensable pour cookies JWT
	});

	//------------------------------------------------------
	// 2. Cookies (avant JWT)
	//------------------------------------------------------
	server.register(fCookie, {
		secret: process.env.DINORPG_SECRET_KEY_COOKIE,
		hook: 'preHandler'
	});

	//------------------------------------------------------
	// 3. JWT
	//------------------------------------------------------
	server.register(fjwt, {
		secret: process.env.DINORPG_SECRET_KEY_JWT as string,
		cookie: {
			cookieName: 'access_token',
			signed: false
		}
	});

	//------------------------------------------------------
	// 4. Hook pour req.jwt
	//------------------------------------------------------
	server.addHook('preHandler', (req, reply, next) => {
		req.jwt = server.jwt;
		next();
	});

	//------------------------------------------------------
	// 5. Décorateur d’authentification
	//------------------------------------------------------
	server.decorate('authenticate', async (req: FastifyRequest, reply: FastifyReply) => {
		const token = req.cookies.access_token;

		if (!token) {
			return reply.status(401).send({ message: 'Authentication required' });
		}

		try {
			const decoded = req.jwt.verify<FastifyJWT['user']>(token);
			req.user = decoded;
		} catch (error) {
			return reply.status(401).send({ message: 'Invalid token' });
		}
	});

	//------------------------------------------------------
	// 6. Healthcheck
	//------------------------------------------------------
	server.get('/healthcheck', async () => ({ status: 'OK' }));

	//------------------------------------------------------
	// 7. Swagger modern (Fastify 4)
	//------------------------------------------------------
	server.register(import('@fastify/swagger'), {
		openapi: {
			info: {
				title: 'DinoRPG API',
				description: 'API documentation',
				version
			}
		}
	});

	server.register(import('@fastify/swagger-ui'), {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false
		},
		staticCSP: true,
		transformStaticCSP: header => header
	});

	//------------------------------------------------------
	// 8. Schemas Zod
	//------------------------------------------------------
	for (const schema of userSchemas) {
		server.addSchema(schema);
	}

	//------------------------------------------------------
	// 9. Routes
	//------------------------------------------------------
	server.register(userRoutes, { prefix: 'api/users' });

	return server;
}

export default buildServer;
