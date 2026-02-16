import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import gameConfig from '../../config/game.config.js';
import { getDinozForLevelUp } from '../Controller/getDinozForLevelUp.controller.js';
import { getDinozLearnableSkills } from './getDinozLearnableSkills.service.js';

/**
 * @summary Get all learnables and unlockables skills
 *
 * @param req.params.id Dinoz id
 * @param req.params.tryNumber Number of level up try (From 1 to 2)
 *
 * @returns Partial<DinozSkillOwnAndUnlockable> | undefined
 */
type GetLearnableSkillsReq = FastifyRequest<{
	Params: {
		id: string; // Fastify params are strings
		tryNumber: string; // idem
	};
}>;

export async function getLearnableAndUnlockableSkills(
	req: GetLearnableSkillsReq,
	_reply: FastifyReply
	//event?: GameDinozUsage
) {
	const dinozId = Number(req.params.id);
	const tryNumber = Number(req.params.tryNumber);

	const authed = req.user;

	const dinozSkills = /*event ? await getEventDinozForLevelUp(dinozId) :*/ await getDinozForLevelUp(dinozId);

	if (!dinozSkills) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	//const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	//const dinozTournament = await isDinozInTournament(dinozId);

	const canLevelUp =
		/*!tournament || !dinozTournament ||*/ dinozSkills.level <
		gameConfig.dinoz.maxLevel; /*+ 1 <= tournament.levelLimit*/
	if (!canLevelUp) {
		throw new ExpectedError('dinozCannotLvlUp', { params: { id: dinozId } });
	}

	if (!dinozSkills.user || dinozSkills.user.id !== authed.id) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't belong to player ${authed.id}`, { statusCode: 403 });
	}

	if (dinozSkills.canRename) {
		throw new ExpectedError(`Dinoz has to be named.`, { statusCode: 400 });
	}

	const dinozRace = Object.values(raceList).find(race => race.raceId === dinozSkills.raceId);
	if (!dinozRace) {
		throw new ExpectedError(`Dinoz race ${dinozSkills.raceId} doesn't exist.`, { statusCode: 500 });
	}

	return getDinozLearnableSkills(req, dinozSkills, dinozRace, dinozId, tryNumber /*event*/);
}
