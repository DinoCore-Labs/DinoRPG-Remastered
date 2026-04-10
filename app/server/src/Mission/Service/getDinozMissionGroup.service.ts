import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { getDinozMissionGroup } from '../Controller/mission.controller.js';

type Params = {
	id: string;
	group: string;
};

export async function getDinozMissionGroupHandler(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		const dinozId = Number(req.params.id);
		const group = req.params.group;

		if (!userId) {
			return reply.code(401).send({ message: 'Authentication required' });
		}

		if (!Number.isInteger(dinozId) || dinozId <= 0) {
			return reply.code(400).send({ message: 'Invalid dinoz id' });
		}

		const result = await prisma.$transaction(tx =>
			getDinozMissionGroup(tx, {
				userId,
				dinozId,
				group
			})
		);

		return reply.send(result);
	} catch (error) {
		if (error instanceof ExpectedError) {
			return reply.code(403).send({ message: error.message });
		}

		throw error;
	}
}
