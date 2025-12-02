import { ExpectedError } from '@dinorpg/core/models/utils/ExpectedError.mjs';
import type { FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

export async function userToolTip(req: FastifyRequest) {
	const id = (req.params as any).id;

	const user = await getToolTipInfos(id);

	if (!user) {
		throw new ExpectedError(`Missing user.`);
	}

	return user;
}

export async function getToolTipInfos(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true
		}
	});
}
