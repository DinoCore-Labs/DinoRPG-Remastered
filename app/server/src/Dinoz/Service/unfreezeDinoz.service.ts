import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { DinozState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assertCanStartUnfreezingDinozAction, getUnfreezeAt } from '../../utils/dinoz/canFreezeDinozAction.js';
import { getActiveDinozCount, getUserMaxDinoz } from '../Controller/getActiveDinoz.js';

export async function unfreezeDinoz(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const userId = req.user.id;
	const dinozId = Number(req.params.id);

	if (!Number.isInteger(dinozId) || dinozId <= 0) {
		throw new ExpectedError('Invalid dinoz id');
	}

	const [dinoz, user] = await Promise.all([
		prisma.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				userId: true,
				state: true,
				stateTimer: true
			}
		}),
		prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				leader: true,
				messie: true
			}
		})
	]);

	if (!dinoz) {
		throw new ExpectedError('No dinoz found');
	}

	if (!user) {
		throw new ExpectedError('No user found');
	}

	if (dinoz.userId !== userId) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	const activeDinozCount = await getActiveDinozCount(userId);
	const maxDinoz = getUserMaxDinoz(user);

	assertCanStartUnfreezingDinozAction(dinoz.state, activeDinozCount, maxDinoz);

	const unfreezeAt = getUnfreezeAt();

	await prisma.dinoz.update({
		where: { id: dinoz.id },
		data: {
			state: DinozState.unfreezing,
			stateTimer: unfreezeAt
		}
	});

	return reply.send({
		success: true,
		unfreezeAt: unfreezeAt.toISOString()
	});
}
