import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { Role } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

/** Run after authentication and the admin/moderator permission check. */
export async function protectSuperAdminTarget(request: FastifyRequest, reply: FastifyReply) {
	const params = request.params as { id?: unknown; userId?: unknown };
	const userId = typeof params.userId === 'string' ? params.userId : params.id;
	if (typeof userId !== 'string' || !z.string().uuid().safeParse(userId).success) {
		return reply.code(400).send({ code: 'request.invalid', message: 'Invalid user id' });
	}
	if (request.user.role === Role.SUPER_ADMIN) return;
	const target = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true }
	});
	if (target?.role === Role.SUPER_ADMIN) {
		return reply.code(403).send({
			code: 'admin.superAdminProtected',
			message: 'Only SUPER_ADMIN may modify the SUPER_ADMIN account.'
		});
	}
}
