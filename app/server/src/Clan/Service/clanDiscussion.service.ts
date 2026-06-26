import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { isMember } from '../Controller/isMember.controller.js';
import { memberHasRight } from '../Controller/memberHasRight.controller.js';
import {
	clanIdParamSchema,
	clanMessagesQuerySchema,
	createClanMessageSchema,
	messageIdParamSchema
} from '../Schema/clan.schema.js';

export async function getClanMessages(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	const query = clanMessagesQuerySchema.parse(req.query);
	const page = query.page ?? 1;

	if (!(await isMember(req.user.id, clanId))) {
		throw new ExpectedError('Access denied');
	}

	const skip = (page - 1) * 20;
	const take = 20;

	const messages = await prisma.clanMessage.findMany({
		where: { clanId },
		orderBy: { date: 'desc' },
		skip,
		take,
		include: {
			author: {
				select: {
					id: true,
					name: true,
					profile: {
						select: {
							avatar: true,
							avatarType: true
						}
					}
				}
			},
			clan: {
				select: {
					leaderId: true
				}
			}
		}
	});

	const mappedMessages = messages.map(msg => {
		let avatarUrl: string | null = null;
		if (msg.author?.profile?.avatar) {
			avatarUrl = `data:${msg.author.profile.avatarType};base64,${Buffer.from(msg.author.profile.avatar).toString('base64')}`;
		}
		return {
			id: msg.id,
			clanId: msg.clanId,
			date: msg.date,
			content: msg.content,
			authorId: msg.authorId,
			authorName: msg.authorName,
			author: msg.author
				? {
						id: msg.author.id,
						name: msg.author.name,
						avatarUrl
					}
				: null,
			clan: msg.clan
		};
	});

	return reply.send(mappedMessages);
}

export async function getClanMessagesCount(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);

	if (!(await isMember(req.user.id, clanId))) {
		throw new ExpectedError('Access denied');
	}

	const count = await prisma.clanMessage.count({
		where: { clanId }
	});

	return reply.send({ count });
}

export async function createClanMessage(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	const body = createClanMessageSchema.parse(req.body);

	if (!(await isMember(req.user.id, clanId))) {
		throw new ExpectedError('Access denied');
	}

	const author = await prisma.user.findUnique({
		where: { id: req.user.id },
		select: {
			id: true,
			name: true,
			profile: {
				select: {
					avatar: true,
					avatarType: true
				}
			}
		}
	});

	if (!author) {
		throw new ExpectedError('User not found');
	}

	const created = await prisma.clanMessage.create({
		data: {
			clanId,
			content: body.content,
			authorId: req.user.id,
			authorName: req.user.name
		},
		include: {
			clan: {
				select: {
					leaderId: true
				}
			}
		}
	});

	let avatarUrl: string | null = null;
	if (author.profile?.avatar) {
		avatarUrl = `data:${author.profile.avatarType};base64,${Buffer.from(author.profile.avatar).toString('base64')}`;
	}

	const mapped = {
		id: created.id,
		clanId: created.clanId,
		date: created.date,
		content: created.content,
		authorId: created.authorId,
		authorName: created.authorName,
		author: {
			id: author.id,
			name: author.name,
			avatarUrl
		},
		clan: created.clan
	};

	return reply.send(mapped);
}

export async function deleteClanMessage(req: FastifyRequest, reply: FastifyReply) {
	const { clanId } = clanIdParamSchema.parse(req.params);
	const { messageId } = messageIdParamSchema.parse(req.params);

	const message = await prisma.clanMessage.findUnique({
		where: { id: messageId },
		include: {
			clan: {
				select: {
					leaderId: true
				}
			}
		}
	});

	if (!message || message.clanId !== clanId) {
		throw new ExpectedError('Message not found');
	}

	const hasModRight = await memberHasRight(req.user.id, clanId, ClanMemberRight.DISCUSSION_DELETE_MESSAGE);
	if (message.authorId !== req.user.id && !hasModRight) {
		throw new ExpectedError('Permission denied');
	}

	await prisma.clanMessage.delete({
		where: { id: messageId }
	});

	return reply.send({ success: true });
}
