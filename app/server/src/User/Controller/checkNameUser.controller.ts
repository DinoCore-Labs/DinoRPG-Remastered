import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

export async function checkNameUser(req: FastifyRequest<{ Params: { name: string } }>, reply: FastifyReply) {
	const { name } = req.params;

	try {
		const exists = await prisma.user.findUnique({
			where: { name }
		});

		return reply.send({
			available: !exists,
			reason: exists ? 'taken' : 'ok'
		});
	} catch (e) {
		console.error(e);
		return reply.code(500).send({
			available: false,
			reason: 'server_error'
		});
	}
}
