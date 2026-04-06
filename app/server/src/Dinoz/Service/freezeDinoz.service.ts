import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { DinozState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assertCanFreezeDinozAction } from '../../utils/dinoz/canFreezeDinozAction.js';

export async function freezeDinoz(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	const userId = req.user.id;
	const dinozId = Number(req.params.id);

	if (!Number.isInteger(dinozId) || dinozId <= 0) {
		throw new ExpectedError('Invalid dinoz id');
	}

	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			userId: true,
			placeId: true,
			life: true,
			state: true,
			stateTimer: true,
			leaderId: true,
			status: {
				select: {
					statusId: true
				}
			},
			followers: {
				select: {
					id: true
				}
			}
		}
	});

	if (!dinoz) {
		throw new ExpectedError('No dinoz found');
	}

	if (dinoz.userId !== userId) {
		throw new ExpectedError('Player does not own this dinoz');
	}

	assertCanFreezeDinozAction(dinoz);

	await prisma.$transaction(async tx => {
		if (dinoz.leaderId) {
			await tx.dinoz.update({
				where: { id: dinoz.id },
				data: {
					leaderId: null
				}
			});
		}

		if (dinoz.followers.length > 0) {
			await tx.dinoz.updateMany({
				where: {
					leaderId: dinoz.id
				},
				data: {
					leaderId: null
				}
			});
		}

		await tx.dinoz.update({
			where: { id: dinoz.id },
			data: {
				state: DinozState.frozen,
				stateTimer: null
			}
		});
	});

	return reply.send({
		success: true
	});
}
