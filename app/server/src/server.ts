import { UserRole } from '@dinorpg/core/models/user/userRole.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import fCookie from '@fastify/cookie';
import cors from '@fastify/cors';
import fjwt, { FastifyJWT } from '@fastify/jwt';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { randomUUID } from 'crypto';
import Fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import {
	jsonSchemaTransform,
	jsonSchemaTransformObject,
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider
} from 'fastify-type-provider-zod';

import { adminRoutes } from './Admin/Routes/admin.routes.js';
import { loadConfig } from './config/config.js';
import { healthcheckResponseSchema } from './config/healthcheck.schema.js';
import { loadDialogs } from './Dialog/Controller/dialog.registry.js';
import { dialogRoutes } from './Dialog/Routes/dialog.routes.js';
import { dinozRoutes } from './Dinoz/Routes/dinoz.routes.js';
import { fightRoutes } from './Fight/Routes/fight.routes.js';
import { gatherRoutes } from './Gather/Routes/gather.routes.js';
import { inventoryRoutes } from './Inventory/Routes/inventory.routes.js';
import { ensureJobsExist } from './jobs/ensureJobs.js';
import { ensureSecretsExist } from './jobs/ensureSecrets.js';
import { healFountainPearlDinozJob } from './jobs/handlers/healFountainPearlDinoz.js';
import { itinerantMerchantMoveJob } from './jobs/handlers/itinerantMerchantMove.js';
import { resetDinozShopAtMidnight } from './jobs/handlers/resetDinozShop.js';
import { startScheduler } from './jobs/scheduler.js';
import { levelRoutes } from './Level/Routes/level.routes.js';
import { missionsRoutes } from './Mission/Routes/mission.routes.js';
import { newsRoutes } from './News/Routes/news.routes.js';
import { rankingRoutes } from './Ranking/Routes/ranking.routes.js';
import { shopRoutes } from './Shop/Routes/shop.routes.js';
import { userRoutes } from './User/Routes/user.routes.js';
import version from './utils/version.js';

const cfg = loadConfig();

async function buildServer() {
	const server = Fastify({
		logger: true,
		trustProxy: true
	}).withTypeProvider<ZodTypeProvider>();

	//-------------------------------------------------------
	// Zod compilers
	//-------------------------------------------------------
	server.setValidatorCompiler(validatorCompiler);
	server.setSerializerCompiler(serializerCompiler);

	//-------------------------------------------------------
	// 1. CORS
	//-------------------------------------------------------
	server.register(cors, {
		origin: cfg.selfUrl.origin,
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization']
	});

	//------------------------------------------------------
	// 2. Cookies (avant JWT)
	//------------------------------------------------------
	server.register(fCookie, {
		secret: cfg.secrets.cookie,
		hook: 'preHandler'
	});
	server.addHook('preHandler', async (req, reply) => {
		const DEVICE_COOKIE = cfg.secrets.deviceCookie;
		let deviceId = req.cookies?.[DEVICE_COOKIE];
		if (!deviceId || typeof deviceId !== 'string') {
			deviceId = randomUUID();
			reply.setCookie(DEVICE_COOKIE, deviceId, {
				path: '/',
				httpOnly: true,
				sameSite: 'lax',
				secure: cfg.isProduction,
				maxAge: 60 * 60 * 24 * 400
			});
		}
		(req as any).deviceId = deviceId;
	});

	//------------------------------------------------------
	// 3. JWT
	//------------------------------------------------------
	server.register(fjwt, {
		secret: cfg.secrets.jwt,
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
	server.decorate('noAuth', async (req: FastifyRequest, _reply: FastifyReply) => {
		const token = req.cookies.access_token;
		if (!token) {
			return;
		}
		try {
			const decoded = req.jwt.verify<FastifyJWT['user']>(token);
			req.user = decoded;
		} catch {
			return;
		}
	});
	server.decorate('admin', async (req: FastifyRequest, reply: FastifyReply) => {
		const role = (req.user as any)?.role as UserRole;
		if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
			return reply.code(403).send({ message: 'Forbidden' });
		}
	});

	//------------------------------------------------------
	// EXTRA : Multipart pour les uploads
	//------------------------------------------------------
	server.register(multipart, {
		limits: {
			fileSize: 1_000_000 // 1MB max
		}
	});

	//------------------------------------------------------
	// 6. Swagger
	//------------------------------------------------------
	await server.register(swagger, {
		openapi: {
			openapi: '3.1.0',
			info: {
				title: 'DinoRPG API',
				description: 'API documentation',
				version: version
			},
			tags: [
				{ name: 'Users', description: 'User account and profile' },
				{ name: 'Inventory', description: 'Player inventory management' },
				{ name: 'Dinoz', description: 'Dinoz actions and management' },
				{ name: 'Level', description: 'Level progression and skill learning' },
				{ name: 'Fight', description: 'Fight system' },
				{ name: 'Gather', description: 'Resource gathering actions' },
				{ name: 'Shop', description: 'Shops and purchases' },
				{ name: 'Ranking', description: 'Player rankings and leaderboard' },
				{ name: 'News', description: 'News endpoints' },
				{ name: 'Admin', description: 'Administration endpoints' }
			]
		},
		transform: jsonSchemaTransform,
		transformObject: jsonSchemaTransformObject
	});

	await server.register(swaggerUI, {
		routePrefix: '/docs',
		uiConfig: {
			docExpansion: 'full',
			deepLinking: false
		},
		staticCSP: true,
		transformStaticCSP: header => header
	});

	//------------------------------------------------------
	// 7. Healthcheck
	//------------------------------------------------------
	server.get(
		'/healthcheck',
		{
			schema: {
				response: {
					200: healthcheckResponseSchema
				}
			}
		},
		async () => ({ status: 'OK' })
	);
	//------------------------------------------------------
	// 8. Dialog registry
	//------------------------------------------------------
	loadDialogs();

	//------------------------------------------------------
	// 9. Routes
	//------------------------------------------------------
	server.register(userRoutes, { prefix: 'api/users' });
	server.register(rankingRoutes, { prefix: 'api/ranking' });
	server.register(inventoryRoutes, { prefix: 'api/inventory' });
	server.register(shopRoutes, { prefix: 'api/shop' });
	server.register(dinozRoutes, { prefix: 'api/dinoz' });
	server.register(fightRoutes, { prefix: 'api/fight' });
	server.register(levelRoutes, { prefix: 'api/level' });
	server.register(gatherRoutes, { prefix: 'api/gather' });
	server.register(newsRoutes, { prefix: 'api/news' });
	server.register(dialogRoutes, { prefix: 'api/dialog' });
	server.register(adminRoutes, { prefix: 'api/admin' });
	server.register(missionsRoutes, { prefix: 'api/missions' });

	//------------------------------------------------------
	// 10. Scheduler
	//------------------------------------------------------
	await ensureJobsExist();
	await ensureSecretsExist(server.log);

	const stopScheduler = startScheduler(
		{
			'reset-dinoz-shop': resetDinozShopAtMidnight,
			'itinerant-merchant-move': () => itinerantMerchantMoveJob(server.log),
			'heal-fountain-pearl-dinoz': async () => {
				const result = await healFountainPearlDinozJob();
				server.log.info({ healedCount: result.healedCount }, '[jobs] heal-fountain-pearl-dinoz processed');
			}
		},
		server.log
	);

	server.addHook('onClose', async () => {
		stopScheduler();
	});
	//------------------------------------------------------
	// EXTRA: Tests
	//------------------------------------------------------
	server.post('/test-upload', async (req, reply) => {
		const file = await req.file();
		console.log('UPLOAD:', {
			filename: file?.filename,
			mimetype: file?.mimetype,
			truncated: file?.file.truncated
		});

		reply.send({ ok: true });
	});
	server.get('/debug-device', async req => {
		return {
			cookieIn: req.cookies?.dz_device ?? null,
			deviceId: (req as FastifyRequest & { deviceId?: string }).deviceId ?? null,
			ip: req.ip
		};
	});

	//------------------------------------------------------
	// EXTRA: Errors
	//------------------------------------------------------
	server.setErrorHandler((err, req, reply) => {
		// 1) Erreurs "attendues"
		if (err instanceof ExpectedError) {
			return reply.code(err.statusCode).send({
				message: err.message,
				params: err.params ?? {}
			});
		}
		// 2) Erreurs Fastify (validation, etc.)
		const fe = err as FastifyError;
		if (typeof fe?.statusCode === 'number') {
			return reply.code(fe.statusCode).send({ message: fe.message });
		}
		// 3) Fallback 500
		req.log.error(err);
		return reply.code(500).send({ message: 'Internal Server Error' });
	});

	return server;
}

export default buildServer;
