import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { startRest } from '../Controller/getRestDinoz.controller.js';

type Params = { id: string };

export async function startResting(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = (req.user as any).id;

	await prisma.$transaction(async tx => {
		const d = await tx.dinoz.findUnique({
			where: { id: dinozId },
			select: {
				id: true,
				userId: true,
				life: true,
				maxLife: true,
				fight: true,
				state: true
			}
		});

		if (!d) throw new ExpectedError('Unknown dinoz');
		if (d.userId !== userId) throw new ExpectedError('Player does not own this dinoz');

		if (d.state) throw new ExpectedError('Dinoz is unavailable');
		if (!d.fight) throw new ExpectedError('Dinoz cannot rest right now');

		if (d.life >= Math.round(d.maxLife / 2)) throw new ExpectedError('Dinoz does not need to rest');

		await startRest(tx, dinozId);
	});

	return reply.send({ ok: true });
}
