import {
	GAME_LOG_AGGREGATION_LOOKBACK_DAYS,
	HOURLY_GAME_LOG_RETENTION_MONTHS,
	TEMPORARY_GAME_LOG_RETENTION_DAYS
} from '@dinorpg/core/models/gamelog/constants.js';

import { GameLogRetention, Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

function subDays(date: Date, days: number) {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() - days);
	return next;
}

function subMonths(date: Date, months: number) {
	const next = new Date(date);
	next.setUTCMonth(next.getUTCMonth() - months);
	return next;
}

export async function aggregateGameLogs(from: Date, to: Date) {
	await prisma.$executeRaw(
		Prisma.sql`
			INSERT INTO game_log_hourly (type, "bucketAt", total, "createdAt", "updatedAt")
			SELECT
				type,
				date_trunc('hour', "createdAt") AS "bucketAt",
				COUNT(*)::int AS total,
				now(),
				now()
			FROM game_log
			WHERE "createdAt" >= ${from}
			  AND "createdAt" < ${to}
			GROUP BY type, date_trunc('hour', "createdAt")
			ON CONFLICT (type, "bucketAt")
			DO UPDATE SET
				total = EXCLUDED.total,
				"updatedAt" = now()
		`
	);
	await prisma.$executeRaw(
		Prisma.sql`
			INSERT INTO game_log_daily (type, day, total, "createdAt", "updatedAt")
			SELECT
				type,
				date_trunc('day', "createdAt")::date AS day,
				COUNT(*)::int AS total,
				now(),
				now()
			FROM game_log
			WHERE "createdAt" >= ${from}
			  AND "createdAt" < ${to}
			GROUP BY type, date_trunc('day', "createdAt")::date
			ON CONFLICT (type, day)
			DO UPDATE SET
				total = EXCLUDED.total,
				"updatedAt" = now()
		`
	);
}

export async function purgeOldGameLogs(now = new Date()) {
	const temporaryLogsBefore = subDays(now, TEMPORARY_GAME_LOG_RETENTION_DAYS);
	const hourlyBefore = subMonths(now, HOURLY_GAME_LOG_RETENTION_MONTHS);
	const deletedTemporaryLogs = await prisma.gameLog.deleteMany({
		where: {
			retention: GameLogRetention.TEMPORARY,
			createdAt: {
				lt: temporaryLogsBefore
			}
		}
	});
	const deletedHourlyLogs = await prisma.gameLogHourly.deleteMany({
		where: {
			bucketAt: {
				lt: hourlyBefore
			}
		}
	});
	return {
		deletedTemporaryLogs: deletedTemporaryLogs.count,
		deletedHourlyLogs: deletedHourlyLogs.count
	};
}

export async function runGameLogMaintenance(now = new Date()) {
	const from = subDays(now, GAME_LOG_AGGREGATION_LOOKBACK_DAYS);
	const to = now;
	await aggregateGameLogs(from, to);
	const purge = await purgeOldGameLogs(now);
	return {
		aggregatedFrom: from,
		aggregatedTo: to,
		...purge
	};
}
