import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { toDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import { getDinozMenuRequest } from '../Controller/getDinozMenu.controller.js';
import { applyRestIfNeeded } from '../Controller/getRestDinoz.controller.js';
import { applyUnfreezeIfNeeded } from '../Controller/getUnfreezeDinoz.controller.js';
import { getAvailableActions } from './getDinozActions.service.js';

export async function getDinozMenu(req: FastifyRequest, reply: FastifyReply) {
	const authedId = req.user.id;

	const dinozIds = await prisma.dinoz.findMany({
		where: {
			userId: authedId
		},
		select: {
			id: true
		}
	});

	const restInfosByDinozId = await prisma.$transaction(async tx => {
		const restInfos = new Map<number, { regen: number; next: string; maxed: boolean }>();

		for (const dinoz of dinozIds) {
			await applyUnfreezeIfNeeded(tx, dinoz.id);

			const restInfo = await applyRestIfNeeded(tx, dinoz.id);

			if (restInfo) {
				restInfos.set(dinoz.id, {
					regen: restInfo.regen,
					next: restInfo.next.toISOString(),
					maxed: restInfo.maxed
				});
			}
		}

		return restInfos;
	});

	const playerData = await getDinozMenuRequest(authedId);

	if (!playerData) {
		throw new ExpectedError('userNotFound', {
			params: {
				authedId
			}
		});
	}

	const dinozList: DinozFiche[] = await Promise.all(
		playerData.dinoz.map(async dinoz => {
			const fiche = toDinozFiche(playerData, dinoz.id, restInfosByDinozId.get(dinoz.id) ?? null);

			fiche.actions = await getAvailableActions(dinoz, playerData);

			return fiche;
		})
	);

	return reply.send(dinozList);
}
