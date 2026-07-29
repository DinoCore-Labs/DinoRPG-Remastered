import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import {
	adminReportParamsSchema,
	adminReportQuerySchema,
	updateAdminReportSchema
} from '../Schema/adminReport.schema.js';

export async function getAdminReportsHandler(request: FastifyRequest, reply: FastifyReply) {
	const query = adminReportQuerySchema.safeParse(request.query);
	const page = query.success ? query.data.page : 1;
	const pageSize = 10;

	const [reports, total] = await prisma.$transaction([
		prisma.report.findMany({
			orderBy: { createdAt: 'desc' },
			skip: (page - 1) * pageSize,
			take: pageSize,
			include: {
				reporter: { select: { id: true, name: true } },
				reportedUser: { select: { id: true, name: true } },
				reportedDinoz: { select: { id: true, name: true, userId: true } },
				reportedClan: { select: { id: true, name: true } }
			}
		}),
		prisma.report.count()
	]);

	return reply.send({ reports, total });
}

export async function updateAdminReportHandler(request: FastifyRequest, reply: FastifyReply) {
	const params = adminReportParamsSchema.safeParse(request.params);
	const body = updateAdminReportSchema.safeParse(request.body);

	if (!params.success || !body.success) {
		return reply.status(400).send({ message: 'Invalid payload' });
	}

	const report = await prisma.report.findUnique({
		where: { id: params.data.id },
		include: { reportedDinoz: true, reportedClan: true }
	});

	if (!report) {
		return reply.status(404).send({ message: 'Report not found' });
	}

	let targetUserId: string | null = null;
	if (report.reportedUserId) targetUserId = report.reportedUserId;

	if (targetUserId && (body.data.banDuration !== undefined || body.data.muteDuration !== undefined)) {
		const updateData: any = {};

		const calcDate = (duration: string | null) => {
			if (duration === 'none' || duration === null) return null;
			const now = Date.now();
			if (duration === '7d') return new Date(now + 7 * 24 * 3600 * 1000);
			if (duration === '1m') return new Date(now + 30 * 24 * 3600 * 1000);
			if (duration === '6m') return new Date(now + 180 * 24 * 3600 * 1000);
			if (duration === 'def') return new Date(now + 100 * 365 * 24 * 3600 * 1000);
			return undefined;
		};

		if (body.data.banDuration !== undefined) {
			const d = calcDate(body.data.banDuration);
			if (d !== undefined) {
				updateData.bannedUntil = d;
				updateData.banReason = d ? report.reason : null;
			}
		}
		if (body.data.muteDuration !== undefined) {
			const d = calcDate(body.data.muteDuration);
			if (d !== undefined) {
				updateData.mutedUntil = d;
				updateData.muteReason = d ? report.reason : null;
			}
		}

		if (Object.keys(updateData).length > 0) {
			await prisma.user.update({
				where: { id: targetUserId },
				data: updateData
			});
		}
	}

	const updated = await prisma.report.update({
		where: { id: params.data.id },
		data: {
			status: body.data.status,
			comment: body.data.comment
		},
		include: {
			reporter: { select: { id: true, name: true } },
			reportedUser: { select: { id: true, name: true } },
			reportedDinoz: { select: { id: true, name: true } },
			reportedClan: { select: { id: true, name: true } }
		}
	});

	return reply.send(updated);
}
