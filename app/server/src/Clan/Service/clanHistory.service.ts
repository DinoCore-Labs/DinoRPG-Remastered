import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { isMember } from '../Controller/isMember.controller.js';

export async function getClanHistory(req: FastifyRequest, reply: FastifyReply) {
	const { clanId, page } = req.params as { clanId: number; page: number };
	if (!(await isMember(req.user.id, clanId))) {
		throw new ExpectedError('Access denied');
	}
	const history = await prisma.clanHistory.findMany({
		where: {
			clanId: clanId
		},
		orderBy: {
			date: 'desc'
		},
		select: {
			id: true,
			date: true,
			type: true,
			authorMessage: true,
			authorId: true,
			author: {
				select: {
					name: true,
					leaderOf: {
						select: {
							id: true
						}
					}
				}
			},
			clanId: true
		},
		take: 20,
		skip: (page - 1) * 20
	});

	const count = await prisma.clanHistory.count({
		where: { clanId: clanId }
	});

	return reply.send({ history, count });
}
