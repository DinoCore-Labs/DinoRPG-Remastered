import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { advanceDinozMissionOnWait } from '../../Mission/Controller/mission.progress.js';
import { prisma } from '../../prisma.js';
import { toDinozFiche } from '../../utils/dinoz/dinozFiche.mapper.js';
import TournamentManager from '../../utils/tournamentManager.js';
import { getDinozFicheRequest } from '../Controller/getDinozFiche.controller.js';
import { applyRestIfNeeded } from '../Controller/getRestDinoz.controller.js';
import { applyUnfreezeIfNeeded } from '../Controller/getUnfreezeDinoz.controller.js';
import { getAvailableActions } from './getDinozActions.service.js';

type Params = { id: string };

export async function getDinozFiche(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	if (!Number.isFinite(dinozId)) {
		throw new ExpectedError('invalidId');
	}
	const authedId = req.user.id;
	const targetDinoz = await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			userId: true
		}
	});
	/*
	 * Vérifier l'existence et l'ownership
	 * AVANT tout traitement lazy.
	 *
	 * Sans cela, un autre joueur pourrait
	 * déclencher repos/dégel/mission WAIT
	 * simplement en connaissant l'id.
	 */
	if (!targetDinoz) {
		throw new ExpectedError('dinozNotFound', {
			params: {
				dinozId
			}
		});
	}
	if (targetDinoz.userId !== authedId) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId: authedId
			}
		});
	}
	// 1) apply resting and check if mission wait time is over
	const restInfos = await prisma.$transaction(async tx => {
		await applyUnfreezeIfNeeded(tx, dinozId);
		await advanceDinozMissionOnWait(tx, dinozId);
		return applyRestIfNeeded(tx, dinozId);
	});
	const ficheRest = restInfos
		? { regen: restInfos.regen, next: restInfos.next.toISOString(), maxed: restInfos.maxed }
		: null;
	// 2) retrieve player from dinozId
	const playerData = await getDinozFicheRequest(dinozId, authedId);
	if (!playerData) {
		throw new ExpectedError('userNotFound', { params: { authedId } });
	}
	if (playerData.dinoz.length === 0) {
		throw new ExpectedError('dinozNotFound', { params: { dinozId } });
	}
	const myDinoz = playerData.dinoz.find(d => d.id === dinozId);
	// If player found is different from player who do the request, throw exception
	if (!myDinoz) {
		throw new ExpectedError('dinozDoesNotBelongToUser', {
			params: {
				dinozId,
				userId: authedId
			}
		});
	}
	const currentTournament = await TournamentManager.getCurrentTournamentState(prisma);
	// Create the answer that will be sent back
	const ret = toDinozFiche(playerData, dinozId, ficheRest, currentTournament);
	ret.actions = await getAvailableActions(myDinoz, playerData);
	return reply.send(ret);
}
