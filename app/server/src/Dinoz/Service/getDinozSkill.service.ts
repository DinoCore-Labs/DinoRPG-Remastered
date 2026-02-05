import { toSkillDetails } from '@dinorpg/core/models/skills/toSkillDetails.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

type Params = { id: string };

/**
 * @summary Get all skills and their state
 * @param req.params.id {string} DinozId
 */
export async function getDinozSkillHandler(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const authed = req.user;
	const dinozId = Number.parseInt(req.params.id, 10);

	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			user: { select: { id: true } },
			skills: { select: { skillId: true, state: true } }
		}
	});

	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}

	if (!dinoz.user || dinoz.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinoz.id} doesn't belong to player ${authed.id}`);
	}

	return toSkillDetails(dinoz.skills);
}
