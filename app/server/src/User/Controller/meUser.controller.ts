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
				role: true,
				wallets: {
					where: { type: 'GOLD' },
					select: { amount: true }
				}
			}
		});

		if (!user) {
			return reply.status(404).send({ message: 'User not found' });
		}

		const gold = user.wallets[0]?.amount ?? 0;

		return reply.send({
			id: user.id,
			name: user.name,
			role: user.role,
			gold
		});
	} catch (err) {
		return reply.status(401).send({ message: 'Invalid token' });
	}
}
