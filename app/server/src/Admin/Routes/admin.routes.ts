import type { FastifyInstance } from 'fastify';

import { getAllSecrets, getSpecificSecret } from '../../jobs/controller/getSpecificSecret.js';
import { setSpecificSecret } from '../../jobs/controller/setSpecificSecret.js';
import { prisma } from '../../prisma.js';
import {
	adminErrorResponseSchema,
	adminJobKeyParamsSchema,
	adminRunJobResponseSchema,
	adminSecretKeyParamsSchema,
	adminSecretListSchema,
	adminSecretSchema,
	notFoundErrorSchema,
	updateAdminSecretBodySchema
} from '../Schema/admin.schema.js';
import {
	addAdminDinozSkillHandler,
	addAdminDinozStatusHandler,
	getAdminDinozDetailsHandler,
	removeAdminDinozSkillHandler,
	removeAdminDinozStatusHandler,
	teleportAdminDinozHandler,
	updateAdminDinozItemsHandler,
	updateAdminDinozLeaderHandler,
	updateAdminDinozProfileHandler,
	updateAdminDinozSkillStateHandler,
	updateAdminDinozStateHandler,
	updateAdminDinozStatsHandler
} from '../Service/adminDinozHandler.service.js';
import {
	getAdminUserDetailsHandler,
	getAdminUserDinozHandler,
	updateAdminUserIngredientsHandler,
	updateAdminUserItemsHandler,
	updateAdminUserProfileHandler,
	updateAdminUserRewardsHandler,
	updateAdminUserUniqueSkillsHandler,
	updateAdminUserWalletHandler
} from '../Service/adminUserHandler.service.js';

export async function adminRoutes(app: FastifyInstance) {
	// User
	app.get(
		'/user/:id',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		getAdminUserDetailsHandler
	);
	app.get(
		'/user/:id/dinoz',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		getAdminUserDinozHandler
	);
	app.patch(
		'/user/:id/profile',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserProfileHandler
	);
	app.post(
		'/user/:id/wallets/update',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserWalletHandler
	);
	app.patch(
		'/user/:id/unique-skills',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserUniqueSkillsHandler
	);
	app.patch(
		'/user/:id/items',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserItemsHandler
	);
	app.patch(
		'/user/:id/ingredients',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserIngredientsHandler
	);
	app.patch(
		'/user/:id/rewards',
		{ preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } },
		updateAdminUserRewardsHandler
	);
	// Dinoz
	app.get('/admin/user/:userId/dinoz/:dinozId', getAdminDinozDetailsHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/profile', updateAdminDinozProfileHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/stats', updateAdminDinozStatsHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/state', updateAdminDinozStateHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/place', teleportAdminDinozHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/leader', updateAdminDinozLeaderHandler);
	app.post('/admin/user/:userId/dinoz/:dinozId/status', addAdminDinozStatusHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/status/remove', removeAdminDinozStatusHandler);
	app.post('/admin/user/:userId/dinoz/:dinozId/skills', addAdminDinozSkillHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/skills/state', updateAdminDinozSkillStateHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/skills/remove', removeAdminDinozSkillHandler);
	app.patch('/admin/user/:userId/dinoz/:dinozId/items', updateAdminDinozItemsHandler);
	// Jobs
	app.get('/jobs', { preHandler: [app.authenticate, app.admin], schema: { tags: ['Admin'] } }, async () => {
		return prisma.jobDefinition.findMany({
			orderBy: { key: 'asc' }
		});
	});
	app.get(
		'/jobs/:key/runs',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin'],
				params: adminJobKeyParamsSchema,
				response: {
					404: adminErrorResponseSchema
				}
			}
		},
		async (req, reply) => {
			const key = (req.params as any).key as string;
			const job = await prisma.jobDefinition.findUnique({ where: { key } });
			if (!job) return reply.code(404).send({ message: 'Job not found' });
			const runs = await prisma.jobRun.findMany({
				where: { jobId: job.id },
				orderBy: { startedAt: 'desc' },
				take: 50
			});
			return runs;
		}
	);
	app.post(
		'/jobs/:key/run',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin'],
				params: adminJobKeyParamsSchema,
				response: {
					200: adminRunJobResponseSchema,
					404: adminErrorResponseSchema
				}
			}
		},
		async (req, reply) => {
			const key = (req.params as any).key as string;
			const job = await prisma.jobDefinition.findUnique({ where: { key } });
			if (!job) return reply.code(404).send({ message: 'Job not found' });
			// “Run now” = nextRunAt = now, le scheduler le prendra au prochain tick
			await prisma.jobDefinition.update({
				where: { key },
				data: {
					nextRunAt: new Date(),
					lastError: null
				}
			});
			return { ok: true };
		}
	);
	// Secrets
	app.get(
		'/secrets',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				tags: ['Admin'],
				response: {
					200: adminSecretListSchema
				}
			}
		},
		async (_request, reply) => {
			const secrets = await getAllSecrets();
			return reply.status(200).send(secrets);
		}
	);
	app.put(
		'/secrets/:key',
		{
			schema: {
				tags: ['Admin'],
				params: adminSecretKeyParamsSchema,
				body: updateAdminSecretBodySchema,
				response: {
					200: adminSecretSchema,
					404: notFoundErrorSchema
				}
			}
		},
		async (request, reply) => {
			const { key } = adminSecretKeyParamsSchema.parse(request.params);
			const { value } = updateAdminSecretBodySchema.parse(request.body);

			const existingSecret = await getSpecificSecret(key);
			if (!existingSecret) {
				return reply.status(404).send({
					message: `Secret "${key}" not found`
				});
			}

			const updatedSecret = await setSpecificSecret(key, value);
			return reply.status(200).send({
				key: updatedSecret.key,
				value: updatedSecret.value
			});
		}
	);
}
