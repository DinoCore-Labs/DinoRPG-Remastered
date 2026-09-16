import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import type { CreateReportBody } from '../Schema/report.schema.js';

export async function createReportHandler(
	request: FastifyRequest<{
		Body: CreateReportBody;
	}>,
	reply: FastifyReply
) {
	const user = request.user;
	if (!user) {
		return reply.status(401).send({
			message: 'Unauthorized'
		});
	}
	const { reason, comment, reportedUserId, reportedDinozId, reportedClanId, reportedForumMessageId } = request.body;
	const normalizedComment = comment?.trim() || undefined;
	if (reason === 'Autre' && !normalizedComment) {
		return reply.status(400).send({
			message: "Le commentaire est obligatoire pour la raison 'Autre'."
		});
	}
	if (reportedUserId && reportedUserId === user.id) {
		return reply.status(403).send({
			message: 'You cannot report yourself.'
		});
	}
	if (reportedClanId) {
		const dbUser = await prisma.user.findUnique({
			where: {
				id: user.id
			},
			select: {
				clanId: true
			}
		});
		if (dbUser?.clanId === reportedClanId) {
			return reply.status(403).send({
				message: 'You cannot report your own clan.'
			});
		}
	}
	let forumSnapshot:
		| {
				reportedForumAuthorId: string;
				reportedForumAuthorName: string;
				reportedForumContent: string;
				reportedForumTopicId: number;
				reportedForumTopicTitle: string;
		  }
		| undefined;
	if (reportedForumMessageId) {
		const message = await prisma.forumMessage.findUnique({
			where: {
				id: reportedForumMessageId
			},
			select: {
				id: true,
				authorId: true,
				authorName: true,
				content: true,
				topic: {
					select: {
						id: true,
						title: true
					}
				}
			}
		});
		if (!message) {
			return reply.status(404).send({
				message: 'Forum message not found.'
			});
		}
		/*
		 * Les messages système, par exemple le
		 * règlement seedé, ne sont pas signalables.
		 */
		if (!message.authorId) {
			return reply.status(400).send({
				message: 'This forum message cannot be reported.'
			});
		}
		if (message.authorId === user.id) {
			return reply.status(403).send({
				message: 'You cannot report your own message.'
			});
		}
		/*
		 * Empêche le spam :
		 * un joueur ne peut avoir qu'un signalement
		 * PENDING sur le même message.
		 */
		const existing = await prisma.report.findFirst({
			where: {
				reporterId: user.id,
				reportedForumMessageId,
				status: 'PENDING'
			},
			select: {
				id: true
			}
		});
		if (existing) {
			return reply.status(409).send({
				code: 'report.forum.alreadyPending',
				message: 'This message has already been reported.'
			});
		}
		forumSnapshot = {
			reportedForumAuthorId: message.authorId,
			reportedForumAuthorName: message.authorName,
			reportedForumContent: message.content,
			reportedForumTopicId: message.topic.id,
			reportedForumTopicTitle: message.topic.title
		};
	}
	const report = await prisma.report.create({
		data: {
			reporterId: user.id,
			reason,
			comment: normalizedComment,
			reportedUserId,
			reportedDinozId,
			reportedClanId,
			reportedForumMessageId,
			...forumSnapshot
		}
	});
	return reply.status(201).send({
		success: true,
		reportId: report.id
	});
}
