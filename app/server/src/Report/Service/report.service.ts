import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import type { CreateReportBody } from '../Schema/report.schema.js';

export async function createReportHandler(request: FastifyRequest<{ Body: CreateReportBody }>, reply: FastifyReply) {
	const user = request.user;
	if (!user) {
		return reply.status(401).send({ message: 'Unauthorized' });
	}

	const { reason, comment, reportedUserId, reportedDinozId, reportedClanId } = request.body;

	if (reason === 'Autre' && (!comment || !comment.trim())) {
		return reply.status(400).send({ message: "Le commentaire est obligatoire pour la raison 'Autre'." });
	}

	if (reportedUserId && reportedUserId === user.id) {
		return reply.status(403).send({ message: 'You cannot report yourself.' });
	}

	if (reportedClanId) {
		const dbUser = await prisma.user.findUnique({
			where: { id: user.id },
			select: { clanId: true }
		});
		if (dbUser?.clanId === reportedClanId) {
			return reply.status(403).send({ message: 'You cannot report your own clan.' });
		}
	}

	const report = await prisma.report.create({
		data: {
			reporterId: user.id,
			reason,
			comment,
			reportedUserId,
			reportedDinozId,
			reportedClanId
		}
	});

	return reply.status(201).send({
		success: true,
		reportId: report.id
	});
}
