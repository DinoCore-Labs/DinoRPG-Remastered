import type { FastifyInstance } from 'fastify';

import { prisma } from '../../prisma.js';
import {
	adminErrorResponseSchema,
	adminJobKeyParamsSchema,
	adminRunJobResponseSchema
} from '../Schema/admin.schema.js';
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
}
