import type { FastifyInstance } from 'fastify';

import { prisma } from '../../prisma.js';

export async function adminJobsRoutes(app: FastifyInstance) {
	app.get('/jobs', { preHandler: [app.authenticate, app.admin] }, async () => {
		return prisma.jobDefinition.findMany({
			orderBy: { key: 'asc' }
		});
	});

	app.get('/jobs/:key/runs', { preHandler: [app.authenticate, app.admin] }, async (req, reply) => {
		const key = (req.params as any).key as string;

		const job = await prisma.jobDefinition.findUnique({ where: { key } });
		if (!job) return reply.code(404).send({ message: 'Job not found' });

		const runs = await prisma.jobRun.findMany({
			where: { jobId: job.id },
			orderBy: { startedAt: 'desc' },
			take: 50
		});

		return runs;
	});

	app.post(
		'/jobs/:key/run',
		{
			preHandler: [app.authenticate, app.admin],
			schema: {
				params: {
					type: 'object',
					required: ['key'],
					properties: { key: { type: 'string' } }
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
