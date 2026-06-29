import { BANK_EXCHANGE_RATE_JOB_KEY } from '@dinorpg/core/models/bank/constants.js';
import { GAME_RULES_ACCEPTANCE_REQUIRED_CODE, GAME_RULES_VERSION } from '@dinorpg/core/models/game/gameRules.js';
import { GAME_LOG_MAINTENANCE_JOB_KEY } from '@dinorpg/core/models/gamelog/constants.js';
import { MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';
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
import { bankRoutes } from './Bank/Routes/bank.routes.js';
import { clanRoutes } from './Clan/Routes/clan.routes.js';
import { loadConfig } from './config/config.js';
import { healthcheckResponseSchema } from './config/healthcheck.schema.js';
import { loadDialogs } from './Dialog/Controller/dialog.registry.js';
import { dialogRoutes } from './Dialog/Routes/dialog.routes.js';
import { dinozRoutes } from './Dinoz/Routes/dinoz.routes.js';
import { fightRoutes } from './Fight/Routes/fight.routes.js';
import { forcebrutRoutes } from './Forcebrut/Routes/forcebrutTournament.routes.js';
import { gatherRoutes } from './Gather/Routes/gather.routes.js';
import { inventoryRoutes } from './Inventory/Routes/inventory.routes.js';
import { ensureJobsExist } from './jobs/ensureJobs.js';
import { ensureSecretsExist } from './jobs/ensureSecrets.js';
import { expireDueMarketOffersJob } from './jobs/handlers/expireMarketOffers.js';
import { gameLogMaintenanceJob } from './jobs/handlers/gameLogMaintenance.js';
import { healFountainPearlDinozJob } from './jobs/handlers/healFountainPearlDinoz.js';
import { itinerantMerchantMoveJob } from './jobs/handlers/itinerantMerchantMove.js';
import { refreshBankExchangeRateJob } from './jobs/handlers/refreshBankExchangeRate.js';
import { resetDinozShopAtMidnight } from './jobs/handlers/resetDinozShop.js';
import { startScheduler } from './jobs/scheduler.js';
import { levelRoutes } from './Level/Routes/level.routes.js';
import { appDiscordClient } from './logger/appDiscordClient.js';
import { marketRoutes } from './Market/Routes/market.routes.js';
import { messagingRoutes } from './Messaging/Routes/messaging.routes.js';
import { missionsRoutes } from './Mission/Routes/mission.routes.js';
import { newsRoutes } from './News/Routes/news.routes.js';
import { rankingRoutes } from './Ranking/Routes/ranking.routes.js';
import { shopRoutes } from './Shop/Routes/shop.routes.js';
import { trainingCenterRoutes } from './TrainingCenter/Routes/trainingCenter.routes.js';
import { userRoutes } from './User/Routes/user.routes.js';
import version from './utils/version.js';
import { versionRoutes } from './Version/Routes/version.routes.js';

const cfg = loadConfig();

type AuthenticatedUser = FastifyJWT['user'] & {
	gameRulesAcceptedVersion?: string | null;
};

const GAME_RULES_EXEMPT_PATHS = new Set(['/api/users/me', '/api/users/me/rules/accept']);

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
			const decoded = req.jwt.verify<AuthenticatedUser>(token);
			req.user = decoded;
			const requestPath = req.url.split('?')[0];
			const isGameRulesExempt = GAME_RULES_EXEMPT_PATHS.has(requestPath);

			if (!isGameRulesExempt && decoded.gameRulesAcceptedVersion !== GAME_RULES_VERSION) {
				return reply.status(403).send({
					code: GAME_RULES_ACCEPTANCE_REQUIRED_CODE,
					currentVersion: GAME_RULES_VERSION
				});
			}
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
				{ name: 'Bank', description: 'Dinoland bank' },
				{ name: 'Dinoz', description: 'Dinoz actions and management' },
				{ name: 'Level', description: 'Level progression and skill learning' },
				{ name: 'Fight', description: 'Fight system' },
				{ name: 'Gather', description: 'Resource gathering actions' },
				{ name: 'Shop', description: 'Shops and purchases' },
				{ name: 'Ranking', description: 'Player rankings and leaderboard' },
				{ name: 'News', description: 'News endpoints' },
				{ name: 'CEF', description: 'Fosselave training center' },
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
	server.register(bankRoutes, { prefix: 'api/bank' });
	server.register(dinozRoutes, { prefix: 'api/dinoz' });
	server.register(fightRoutes, { prefix: 'api/fight' });
	server.register(levelRoutes, { prefix: 'api/level' });
	server.register(gatherRoutes, { prefix: 'api/gather' });
	server.register(newsRoutes, { prefix: 'api/news' });
	server.register(dialogRoutes, { prefix: 'api/dialog' });
	server.register(adminRoutes, { prefix: 'api/admin' });
	server.register(missionsRoutes, { prefix: 'api/missions' });
	server.register(messagingRoutes, { prefix: 'api/messaging' });
	server.register(trainingCenterRoutes, { prefix: 'api/cef' });
	server.register(marketRoutes, { prefix: 'api/market' });
	server.register(forcebrutRoutes, { prefix: 'api/forcebrut' });
	server.register(clanRoutes, { prefix: 'api/clan' });
	server.register(versionRoutes, { prefix: 'api' });

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
			},
			[MARKET_EXPIRATION_JOB_KEY]: () => expireDueMarketOffersJob(server.log),
			[GAME_LOG_MAINTENANCE_JOB_KEY]: () => gameLogMaintenanceJob(server.log),
			[BANK_EXCHANGE_RATE_JOB_KEY]: () => refreshBankExchangeRateJob(server.log)
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
				code: err.code,
				message: err.message,
				params: err.params ?? {}
			});
		}
		// 2) Erreurs Fastify / validation
		const fe = err as FastifyError;
		if (typeof fe?.statusCode === 'number') {
			return reply.code(fe.statusCode).send({
				code: 'request.invalid',
				message: fe.message
			});
		}
		// 3) Fallback 500
		const errorId = randomUUID();
		req.log.error({ err, errorId }, 'Unhandled server error');
		appDiscordClient.sendError(err, {
			scope: 'server.errorHandler',
			errorId,
			req,
			reply
		});
		return reply.code(500).send({
			code: 'server.internalError',
			message: 'Internal Server Error',
			errorId
		});
	});

	return server;
}

export default buildServer;
