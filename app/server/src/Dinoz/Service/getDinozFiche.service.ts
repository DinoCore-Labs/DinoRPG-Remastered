import { Action, actionList } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import {
	assertMtDungeonEntry,
	getMtDungeonArchive,
	MtDungeonEntryError
} from '../../Dungeon/Service/mtDungeonRuntime.service.js'; // STEP_20O_MT_DUNGEON
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
	// STEP_20O_MT_DUNGEON: suppress ordinary world actions for every member of an active run.
	// The dungeon entrance/scene remains authoritative; never trust a client-provided run id.
	const activeRun = await prisma.mtDungeonRun.findFirst({
		where: { userId: authedId, leaderDinozId: myDinoz.leaderId ?? myDinoz.id },
		select: { leaderDinozId: true, mapId: true }
	});
	if (activeRun) {
		ret.dungeon = {
			leaderDinozId: activeRun.leaderDinozId,
			dungeonId: activeRun.mapId.slice(0, activeRun.mapId.lastIndexOf('_'))
		};
		ret.actions = [];
		ret.borderPlace = [];
		return reply.send(ret);
	}
	ret.actions = await getAvailableActions(myDinoz, playerData);
	// Show the same entry as the server accepts; the start route rechecks atomically.
	if (
		myDinoz.leaderId === null &&
		myDinoz.placeId === PlaceEnum.PYLONES_DE_MAGNETITES &&
		myDinoz.state === null &&
		myDinoz.life > 0 &&
		myDinoz.fight
	) {
		try {
			await assertMtDungeonEntry(getMtDungeonArchive(), { userId: authedId, leaderDinozId: myDinoz.id }, 'stepp_0');
			ret.actions.push(actionList[Action.DUNGEON]);
		} catch (error) {
			if (!(error instanceof MtDungeonEntryError)) throw error;
		}
	}
	return reply.send(ret);
}
