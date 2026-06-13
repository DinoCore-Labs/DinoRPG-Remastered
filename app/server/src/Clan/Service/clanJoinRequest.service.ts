import { CLAN_JOIN_MONEY, CLAN_MAX_MEMBERS_AMOUNT } from '@dinorpg/core/models/clan/constants.js';
import { ClanHistoryType } from '@dinorpg/core/models/enums/ClanHistoryType.js';
import { ClanMemberRight } from '@dinorpg/core/models/enums/ClanMemberRight.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { memberHasRight } from '../Controller/memberHasRight.controller.js';
import { clanIdParamSchema, joinRequestIdParamSchema } from '../Schema/clan.schema.js';

export async function getJoinRequestslist(req: FastifyRequest, reply: FastifyReply) {
	const params = clanIdParamSchema.parse(req.params);

	const response = await prisma.clanJoinRequest.findMany({
		where: {
			clanId: params.clanId
		},
		select: {
			id: true,
			date: true,
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});
	return reply.send(response);
}

export async function acceptJoinClanRequest(req: FastifyRequest, reply: FastifyReply) {
	const params = joinRequestIdParamSchema.parse(req.params);

	const clanRequest = await prisma.clanJoinRequest.findUnique({
		where: {
			id: params.requestId
		},
		select: {
			clanId: true,
			userId: true,
			user: {
				select: {
					name: true
				}
			},
			clan: {
				select: {
					_count: {
						select: {
							members: true
						}
					},
					name: true,
					id: true
				}
			}
		}
	});
	if (!clanRequest) {
		throw new ExpectedError(`Request doesn't exist.`);
	}
	if (!(await memberHasRight(req.user.id, clanRequest.clanId, ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS))) {
		throw new ExpectedError('Permission denied');
	}
	if (clanRequest.clan._count.members >= CLAN_MAX_MEMBERS_AMOUNT) {
		throw new ExpectedError(`Clan is full`);
	}

	const newMember = await prisma.$transaction(async tx => {
		const member = await tx.clanMember.create({
			data: {
				clanId: clanRequest.clanId,
				userId: clanRequest.userId,
				rights: []
			},
			select: {
				id: true,
				clanId: true,
				dateJoin: true,
				nickname: true,
				rights: true,
				donation: true,
				userId: true,
				user: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});

		await tx.user.update({
			where: { id: clanRequest.userId },
			data: { clanId: clanRequest.clanId }
		});

		await tx.clanJoinRequest.delete({
			where: { id: params.requestId }
		});

		await tx.clanHistory.create({
			data: {
				clanId: clanRequest.clanId,
				authorId: clanRequest.userId,
				type: ClanHistoryType.PLAYER_JOIN,
				authorMessage: clanRequest.user.name
			}
		});

		return member;
	});

	return reply.send(newMember);
}

export async function denyJoinClanRequest(req: FastifyRequest, reply: FastifyReply) {
	const params = joinRequestIdParamSchema.parse(req.params);

	const clanRequest = await prisma.clanJoinRequest.findUnique({
		where: {
			id: params.requestId
		},
		select: {
			clanId: true,
			user: {
				select: {
					id: true
				}
			}
		}
	});

	if (!clanRequest) {
		throw new ExpectedError(`Request doesn't exist.`);
	}

	const isAdmin = await memberHasRight(
		req.user.id,
		clanRequest.clanId,
		ClanMemberRight.MEMBER_ACCEPT_AND_DENY_REQUESTS
	);
	const isOwner = req.user.id === clanRequest.user.id;

	if (!isAdmin && !isOwner) {
		throw new ExpectedError('Permission denied');
	}

	await prisma.clanJoinRequest.delete({
		where: { id: params.requestId }
	});

	return reply.send({ success: true });
}

export async function joinClan(req: FastifyRequest, reply: FastifyReply) {
	const params = clanIdParamSchema.parse(req.params);
	const userId = req.user.id;

	const existingMember = await prisma.clanMember.findUnique({
		where: { userId }
	});
	if (existingMember) {
		throw new ExpectedError('alreadyInAClan');
	}

	const existingRequest = await prisma.clanJoinRequest.findUnique({
		where: { userId }
	});
	if (existingRequest) {
		throw new ExpectedError('alreadyHasPendingRequest');
	}

	const wallet = await prisma.userWallet.findUnique({
		where: {
			userId_type: {
				userId,
				type: 'GOLD'
			}
		}
	});
	if (!wallet || wallet.amount < CLAN_JOIN_MONEY) {
		throw new ExpectedError('notEnoughGold');
	}

	await removeMoney(userId, CLAN_JOIN_MONEY);

	const request = await prisma.clanJoinRequest.create({
		data: {
			clanId: params.clanId,
			userId: userId
		},
		select: {
			id: true,
			date: true,
			clan: {
				select: {
					id: true,
					name: true,
					leaderId: true,
					members: {
						select: {
							userId: true,
							rights: true
						}
					}
				}
			},
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});

	return reply.send(request);
}

export async function getSelfJoinRequest(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	const request = await prisma.clanJoinRequest.findUnique({
		where: { userId },
		select: {
			id: true,
			date: true,
			clan: {
				select: {
					id: true,
					name: true,
					leaderId: true,
					members: {
						select: {
							userId: true,
							rights: true
						}
					}
				}
			},
			user: {
				select: {
					id: true,
					name: true
				}
			}
		}
	});

	return reply.send(request);
}
