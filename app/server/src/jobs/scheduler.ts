import { logSchedulerError, logSchedulerSuccess } from '../logger/Helpers/logScheduler.js';
import { prisma } from '../prisma.js';
import {
	TOURNAMENT_FINALS_R0_JOB_KEY,
	TOURNAMENT_FINALS_R1_JOB_KEY,
	TOURNAMENT_FINALS_R2_JOB_KEY,
	TOURNAMENT_FINALS_R3_JOB_KEY,
	TOURNAMENT_FINALS_R4_JOB_KEY,
	TOURNAMENT_INIT_JOB_KEY,
	TOURNAMENT_POOLS_R1_JOB_KEY,
	TOURNAMENT_POOLS_R2_JOB_KEY,
	TOURNAMENT_POOLS_START_JOB_KEY
} from '../utils/tournamentManager.js';
import { nextDailyAtUtc, nextWeeklyAtUtc } from './helpers/time.js';

const WEEKLY_JOB_DAYS: Record<string, number> = {
	[TOURNAMENT_INIT_JOB_KEY]: 0,
	[TOURNAMENT_POOLS_START_JOB_KEY]: 0,
	[TOURNAMENT_POOLS_R1_JOB_KEY]: 1,
	[TOURNAMENT_POOLS_R2_JOB_KEY]: 1,
	[TOURNAMENT_FINALS_R0_JOB_KEY]: 3,
	[TOURNAMENT_FINALS_R1_JOB_KEY]: 4,
	[TOURNAMENT_FINALS_R2_JOB_KEY]: 5,
	[TOURNAMENT_FINALS_R3_JOB_KEY]: 6,
	[TOURNAMENT_FINALS_R4_JOB_KEY]: 0
};

const INSTANCE_ID = process.env.INSTANCE_ID ?? `local-${process.pid}`;

type JobHandlerResult = void | { nextRunAt?: Date | null };
type JobHandler = () => Promise<JobHandlerResult>;

function resolveNextRun(
	job: {
		key: string;
		type: 'DAILY_AT' | 'INTERVAL';
		dailyHour: number | null;
		dailyMinute: number | null;
		intervalMs: number | null;
	},
	result: JobHandlerResult
) {
	if (result && typeof result === 'object' && 'nextRunAt' in result) {
		return result.nextRunAt ?? null;
	}
	return computeNextRun(job);
}

function computeNextRun(job: {
	key: string;
	type: 'DAILY_AT' | 'INTERVAL';
	dailyHour: number | null;
	dailyMinute: number | null;
	intervalMs: number | null;
}) {
	if (job.type === 'DAILY_AT') {
		const weeklyDay = WEEKLY_JOB_DAYS[job.key];
		if (weeklyDay !== undefined) {
			return nextWeeklyAtUtc(weeklyDay, job.dailyHour ?? 0, job.dailyMinute ?? 0);
		}
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
				const result = await handler();
				const nextRunAt = resolveNextRun(job as any, result);
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
				logSchedulerSuccess('jobs.scheduler', {
					jobKey: job.key,
					jobId: job.id,
					jobRunId: run.id,
					status: 'SUCCESS',
					nextRunAt,
					instanceId: INSTANCE_ID
				});
				log.info(`[jobs] done ${job.key}`);
			} catch (err: any) {
				const msg = String(err?.message ?? err);
				log.error({ err }, `[jobs] failed ${job.key}`);
				logSchedulerError('jobs.scheduler', err, {
					jobKey: job.key,
					jobId: job.id,
					jobRunId: run.id,
					status: 'FAILED',
					instanceId: INSTANCE_ID
				});
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
