import type { FastifyReply, FastifyRequest } from 'fastify';

import {
	getAdminGameLogDailyStats,
	getAdminGameLogHourlyStats,
	getAdminGameLogs,
	getAdminGameLogSummary
} from '../Controller/adminGamelog.controller.js';
import {
	adminGameLogDailyQuerySchema,
	adminGameLogHourlyQuerySchema,
	adminGameLogListQuerySchema,
	adminGameLogSummaryQuerySchema
} from '../Schema/adminGamelog.schema.js';

export async function getAdminGameLogsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsed = adminGameLogListQuerySchema.safeParse(request.query);
	if (!parsed.success) {
		return reply.status(400).send({
			message: 'Invalid game log query',
			issues: parsed.error.flatten()
		});
	}
	const result = await getAdminGameLogs(parsed.data);
	return reply.status(200).send(result);
}

export async function getAdminGameLogHourlyStatsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsed = adminGameLogHourlyQuerySchema.safeParse(request.query);
	if (!parsed.success) {
		return reply.status(400).send({
			message: 'Invalid hourly stats query',
			issues: parsed.error.flatten()
		});
	}
	const result = await getAdminGameLogHourlyStats(parsed.data);
	return reply.status(200).send(result);
}

export async function getAdminGameLogDailyStatsHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsed = adminGameLogDailyQuerySchema.safeParse(request.query);
	if (!parsed.success) {
		return reply.status(400).send({
			message: 'Invalid daily stats query',
			issues: parsed.error.flatten()
		});
	}
	const result = await getAdminGameLogDailyStats(parsed.data);
	return reply.status(200).send(result);
}

export async function getAdminGameLogSummaryHandler(request: FastifyRequest, reply: FastifyReply) {
	const parsed = adminGameLogSummaryQuerySchema.safeParse(request.query);
	if (!parsed.success) {
		return reply.status(400).send({
			message: 'Invalid summary query',
			issues: parsed.error.flatten()
		});
	}
	const result = await getAdminGameLogSummary(parsed.data);
	return reply.status(200).send(result);
}
