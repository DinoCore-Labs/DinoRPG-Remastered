import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { applyRestIfNeeded, stopRest } from '../Controller/getRestDinoz.controller.js';

type Params = { id: string };

export async function stopResting(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) throw new ExpectedError('invalidId');

	const authedId = req.user.id;

	await prisma.$transaction(async tx => {
		const d = await tx.dinoz.findUnique({
			where: { id: dinozId },
			select: { id: true, userId: true, state: true, stateTimer: true }
		});

		if (!d) throw new ExpectedError('dinozNotFound', { params: { dinozId } });
		if (d.userId !== authedId) throw new ExpectedError('notOwner');
		if (d.state !== 'resting') throw new ExpectedError('notResting');

		// ✅ applique ce qui est dû avant d'arrêter
		await applyRestIfNeeded(tx, dinozId);

		// ✅ stop repos
		await stopRest(tx, dinozId);
	});

	return reply.send({ ok: true });
}
