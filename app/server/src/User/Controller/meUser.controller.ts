import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

export async function meUser(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id; // OK → issu du JWT

		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				name: true,
				role: true
			}
		});

		if (!user) {
			return reply.status(404).send({ message: 'User not found' });
		}

		return reply.send(user);
	} catch (err) {
		return reply.status(401).send({ message: 'Invalid token' });
	}
}
