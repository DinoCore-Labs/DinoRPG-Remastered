import { prisma } from '../prisma.js';
import { nextDailyAtUtc } from './helpers/time.js';

const INSTANCE_ID = process.env.INSTANCE_ID ?? `local-${process.pid}`;

type JobHandler = () => Promise<void>;

function computeNextRun(job: {
	type: 'DAILY_AT' | 'INTERVAL';
	dailyHour: number | null;
	dailyMinute: number | null;
	intervalMs: number | null;
}) {
	if (job.type === 'DAILY_AT') {
		return nextDailyAtUtc(job.dailyHour ?? 0, job.dailyMinute ?? 0);
	}
	if (job.type === 'INTERVAL') {
		const ms = job.intervalMs ?? 60_000;
		return new Date(Date.now() + ms);
	}
	return null;
}

async function acquireLock(jobId: string, lockTimeoutS: number) {
	const now = new Date();
	const expiredBefore = new Date(now.getTime() - lockTimeoutS * 1000);

	const updated = await prisma.jobDefinition.updateMany({
		where: {
			id: jobId,
			OR: [{ lockedAt: null }, { lockedAt: { lt: expiredBefore } }]
		},
		data: {
			lockedAt: now,
			lockedBy: INSTANCE_ID,
			status: 'RUNNING'
		}
	});

	return updated.count === 1;
}

export function startScheduler(
	handlers: Record<string, JobHandler>,
	log: { info: Function; error: Function },
	tickMs = 10_000
) {
	const timer = setInterval(async () => {
		const now = new Date();

		const dueJobs = await prisma.jobDefinition.findMany({
			where: {
				enabled: true,
				nextRunAt: { lte: now }
			},
			orderBy: { nextRunAt: 'asc' },
			take: 20
		});

		for (const job of dueJobs) {
			const handler = handlers[job.key];
			if (!handler) continue;

			const locked = await acquireLock(job.id, job.lockTimeoutS);
			if (!locked) continue;

			const run = await prisma.jobRun.create({
				data: { jobId: job.id, triggeredBy: 'scheduler' }
			});

			try {
				log.info(`[jobs] start ${job.key}`);
				await handler();

				const nextRunAt = computeNextRun(job as any);

				await prisma.jobDefinition.update({
					where: { id: job.id },
					data: {
						status: 'SUCCESS',
						lastRunAt: new Date(),
						nextRunAt,
						lastError: null,
						lockedAt: null,
						lockedBy: null
					}
				});

				await prisma.jobRun.update({
					where: { id: run.id },
					data: { endedAt: new Date(), success: true }
				});

				log.info(`[jobs] done ${job.key}`);
			} catch (err: any) {
				const msg = String(err?.message ?? err);
				log.error({ err }, `[jobs] failed ${job.key}`);

				const nextRunAt = computeNextRun(job as any);

				await prisma.jobDefinition.update({
					where: { id: job.id },
					data: {
						status: 'FAILED',
						lastRunAt: new Date(),
						nextRunAt,
						lastError: msg,
						lockedAt: null,
						lockedBy: null
					}
				});

				await prisma.jobRun.update({
					where: { id: run.id },
					data: { endedAt: new Date(), success: false, error: msg }
				});
			}
		}
	}, tickMs);

	log.info(`[jobs] scheduler started (tick=${tickMs}ms, instance=${INSTANCE_ID})`);

	return () => clearInterval(timer);
}
