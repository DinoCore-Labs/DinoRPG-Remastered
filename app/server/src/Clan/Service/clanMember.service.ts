import { ClanHistoryType } from '@dinorpg/core/models/enums/ClanHistoryType.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { isLeader } from '../Controller/isLeader.controller.js';
import { isMember } from '../Controller/isMember.controller.js';
import { memberHasRight } from '../Controller/memberHasRight.controller.js';
import { clanIdParamSchema, updateClanMemberRequestBodySchema } from '../Schema/clan.schema.js';

export async function getMemberHasRight(req: FastifyRequest, reply: FastifyReply) {
	try {
		const { clanId, right } = req.params as { clanId: number; right: ClanMemberRight };
		return reply.send(await memberHasRight(req.user.id, clanId, right));
	} catch (err) {
		return reply.status(400).send({ error: 'Invalid request' });
	}
}

export async function getClanMember(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, memberId } = req.params as { clanId: number; memberId: number };

	if (!(await isMember(req.user.id, clanId))) {
		throw new ExpectedError('Access denied');
	}

	const member = await prisma.clanMember.findUnique({
		where: { id: memberId },
		select: {
			id: true,
			nickname: true,
			rights: true,
			user: {
				select: {
					name: true,
					id: true
				}
			}
		}
	});

	if (!member) {
		throw new ExpectedError('Member not found');
	}

	return reply.send(member);
}

export async function updateClanMember(req: FastifyRequest, reply: FastifyReply) {
	const params = clanIdParamSchema.parse(req.params);
	const body = updateClanMemberRequestBodySchema.parse(req.body);

	if (!(await memberHasRight(req.user.id, params.clanId, ClanMemberRight.MEMBER_EDIT))) {
		throw new ExpectedError('Permission denied');
	}

	await prisma.clanMember.update({
		where: { id: body.clanMember.id },
		data: {
			nickname: body.clanMember.nickname,
			rights: body.clanMember.rights
		}
	});
	return reply.send({ success: true });
}

export async function excludeClanMember(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, memberId } = req.params as { clanId: number; memberId: number };

	if (!(await memberHasRight(req.user.id, clanId, ClanMemberRight.MEMBER_EXCLUDE))) {
		throw new ExpectedError('Permission denied');
	}

	const member = await prisma.clanMember.findUnique({
		where: { id: memberId },
		select: {
			userId: true,
			user: { select: { name: true } },
			clan: { select: { leaderId: true } }
		}
	});

	if (!member) {
		throw new ExpectedError('Member not found');
	}

	if (member.clan.leaderId === member.userId) {
		throw new ExpectedError('Cannot exclude the leader');
	}

	await prisma.$transaction(async tx => {
		await tx.clanMember.delete({
			where: { id: memberId }
		});
		await tx.user.update({
			where: { id: member.userId },
			data: { clanId: null }
		});
		await tx.clanHistory.create({
			data: {
				clanId: clanId,
				authorId: req.user.id,
				type: ClanHistoryType.PLAYER_EXCLUSION,
				authorMessage: member.user.name
			}
		});
	});

	return reply.send({ success: true });
}

export async function leaveClanSelf(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	const member = await prisma.clanMember.findUnique({
		where: { userId: userId },
		select: {
			id: true,
			clanId: true,
			clan: { select: { leaderId: true } }
		}
	});

	if (!member) {
		throw new ExpectedError('You are not in a clan');
	}

	if (member.clan.leaderId === userId) {
		throw new ExpectedError('Leader cannot leave');
	}

	await prisma.$transaction(async tx => {
		await tx.clanMember.delete({
			where: { id: member.id }
		});
		await tx.user.update({
			where: { id: userId },
			data: { clanId: null }
		});
		await tx.clanHistory.create({
			data: {
				clanId: member.clanId,
				authorId: userId,
				type: ClanHistoryType.PLAYER_LEAVE,
				authorMessage: req.user.name
			}
		});
	});

	return reply.send({ success: true });
}

export async function getClanMembersList(req: FastifyRequest, reply: FastifyReply) {
	const params = clanIdParamSchema.parse(req.params);

	const membersList = await prisma.clanMember.findMany({
		where: {
			clanId: params.clanId
		},
		select: {
			id: true,
			nickname: true,
			rights: true,
			donation: true,
			userId: true,
			user: {
				select: {
					id: true,
					name: true,
					leaderOf: {
						select: {
							id: true
						}
					},
					lastLogin: true
				}
			},
			clan: {
				select: {
					id: true
				}
			}
		},
		orderBy: {
			id: 'asc'
		}
	});

	return reply.send(membersList);
}

export async function updateClanLeader(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, id } = req.params as { clanId: number; id: string };
	const userId = id;

	if (!(await isLeader(req.user.id, clanId))) {
		throw new ExpectedError('Permission denied');
	}

	const newLeader = await prisma.$transaction(async tx => {
		await tx.clan.update({
			where: {
				id: clanId
			},
			data: {
				leaderId: userId
			}
		});

		await tx.clanMember.update({
			where: {
				userId: userId
			},
			data: {
				rights: Object.values(ClanMemberRight)
			}
		});

		await tx.clanHistory.create({
			data: {
				clanId: clanId,
				authorId: userId,
				type: ClanHistoryType.NEW_LEADER,
				authorMessage: req.user.name
			}
		});
	});
	return reply.send(newLeader);
}
