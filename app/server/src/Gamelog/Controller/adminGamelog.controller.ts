import { GameLogRetention, GameLogType, Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import {
	AdminGameLogDailyQuery,
	AdminGameLogHourlyQuery,
	AdminGameLogListQuery,
	AdminGameLogSummaryQuery
} from '../Schema/adminGamelog.schema.js';

function parseDateOnlyUtc(value: string) {
	const [year, month, day] = value.split('-').map(Number);
	return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function addUtcDays(date: Date, days: number) {
	const next = new Date(date);
	next.setUTCDate(next.getUTCDate() + days);
	return next;
}

function toIsoDate(date: Date) {
	return date.toISOString().slice(0, 10);
}

function mapGameLog(log: {
	id: bigint;
	type: GameLogType;
	retention: GameLogRetention;
	values: string[];
	metadata: Prisma.JsonValue | null;
	userId: string | null;
	dinozId: number | null;
	actorUserId: string | null;
	userNameSnapshot: string | null;
	dinozNameSnapshot: string | null;
	actorNameSnapshot: string | null;
	createdAt: Date;
}) {
	return {
		...log,
		id: log.id.toString()
	};
}

export async function getAdminGameLogs(query: AdminGameLogListQuery) {
	const where: Prisma.GameLogWhereInput = {
		...(query.type ? { type: query.type } : {}),
		...(query.retention ? { retention: query.retention } : {}),
		...(query.userId ? { userId: query.userId } : {}),
		...(query.dinozId ? { dinozId: query.dinozId } : {}),
		...(query.actorUserId ? { actorUserId: query.actorUserId } : {}),
		...(query.from || query.to
			? {
					createdAt: {
						...(query.from ? { gte: new Date(query.from) } : {}),
						...(query.to ? { lte: new Date(query.to) } : {})
					}
				}
			: {})
	};
	const [total, logs] = await Promise.all([
		prisma.gameLog.count({ where }),
		prisma.gameLog.findMany({
			where,
			orderBy: {
				createdAt: 'desc'
			},
			take: query.take,
			skip: query.skip
		})
	]);
	return {
		total,
		logs: logs.map(mapGameLog)
	};
}

export async function getAdminGameLogHourlyStats(query: AdminGameLogHourlyQuery) {
	const from = parseDateOnlyUtc(query.date);
	const to = addUtcDays(from, 1);
	const rows = await prisma.gameLogHourly.findMany({
		where: {
			type: query.type,
			bucketAt: {
				gte: from,
				lt: to
			}
		},
		orderBy: {
			bucketAt: 'asc'
		}
	});
	const byHour = new Map(rows.map(row => [row.bucketAt.getUTCHours(), row.total]));
	return Array.from({ length: 24 }, (_, hour) => {
		const bucketAt = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), hour, 0, 0, 0));
		return {
			bucketAt: bucketAt.toISOString(),
			hour,
			total: byHour.get(hour) ?? 0
		};
	});
}

export async function getAdminGameLogDailyStats(query: AdminGameLogDailyQuery) {
	const from = parseDateOnlyUtc(query.from);
	const toExclusive = addUtcDays(parseDateOnlyUtc(query.to), 1);
	const rows = await prisma.gameLogDaily.findMany({
		where: {
			type: query.type,
			day: {
				gte: from,
				lt: toExclusive
			}
		},
		orderBy: {
			day: 'asc'
		}
	});
	const byDay = new Map(rows.map(row => [toIsoDate(row.day), row.total]));
	const result: { day: string; total: number }[] = [];
	for (let cursor = new Date(from); cursor.getTime() < toExclusive.getTime(); cursor = addUtcDays(cursor, 1)) {
		const day = toIsoDate(cursor);
		result.push({
			day,
			total: byDay.get(day) ?? 0
		});
	}
	return result;
}

export async function getAdminGameLogSummary(query: AdminGameLogSummaryQuery) {
	const from = parseDateOnlyUtc(query.from);
	const toExclusive = addUtcDays(parseDateOnlyUtc(query.to), 1);
	const rows = await prisma.gameLogDaily.groupBy({
		by: ['type'],
		where: {
			day: {
				gte: from,
				lt: toExclusive
			}
		},
		_sum: {
			total: true
		},
		orderBy: {
			type: 'asc'
		}
	});
	return rows.map(row => ({
		type: row.type,
		total: row._sum.total ?? 0
	}));
}
