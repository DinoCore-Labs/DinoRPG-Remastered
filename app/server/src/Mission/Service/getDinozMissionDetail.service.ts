import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { getDinozMissionDetail } from '../Controller/getDinozMissionDetail.controller.js';

type Params = {
	id: string;
	missionKey: string;
};

export async function getDinozMissionDetailHandler(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		const dinozId = Number(req.params.id);
		const missionKey = req.params.missionKey;

		if (!userId) {
			return reply.code(401).send({ message: 'Authentication required' });
		}

		if (!Number.isInteger(dinozId) || dinozId <= 0) {
			return reply.code(400).send({ message: 'Invalid dinoz id' });
		}

		if (!missionKey) {
			return reply.code(400).send({ message: 'Invalid mission key' });
		}

		const result = await prisma.$transaction(tx =>
			getDinozMissionDetail(tx, {
				userId,
				dinozId,
				missionKey
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
