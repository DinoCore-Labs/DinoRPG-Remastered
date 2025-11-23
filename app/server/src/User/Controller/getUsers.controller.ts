import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
	const users = await prisma.user.findMany({
		select: {
			name: true,
			id: true
		}
	});

	return reply.code(200).send(users);
}
