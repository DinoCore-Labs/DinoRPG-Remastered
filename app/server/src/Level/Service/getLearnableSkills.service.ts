import { levelList } from '@dinorpg/core/models/dinoz/dinozLevel.js';
import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { Dinoz, DinozItems, DinozSkills, DinozSkillsUnlockable, DinozStatus, User } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { getLearnableSkills, getUnlockableSkills } from '../../utils/dinoz/level.mapper.js';
import { getDinozForLevelUp } from '../Controller/getDinozForLevelUp.controller.js';

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

function getDinozLearnableSkills(
	req: GetLearnableSkillsReq,
	dinoz: Pick<
		Dinoz,
		| 'level'
		| 'experience'
		| 'nextUpElementId'
		| 'nextUpAltElementId'
		| 'nbrUpFire'
		| 'nbrUpWood'
		| 'nbrUpWater'
		| 'nbrUpLightning'
		| 'nbrUpAir'
		| 'raceId'
		| 'seed'
		| 'name'
		| 'display'
	> & {
		user: Pick<User, 'id'> | null;
		skills: Pick<DinozSkills, 'skillId'>[];
		items: Pick<DinozItems, 'itemId'>[];
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
	},
	race: DinozRace,
	dinozId: number,
	tryNumber: number
	//event?: GameDinozUsage
) {
	if (dinoz.level === gameConfig.dinoz.maxLevel) {
		throw new ExpectedError(`Dinoz ${dinozId} is already at max level.`);
	}

	const level = levelList.find(level => level.id === dinoz.level);
	if (!level) {
		throw new ExpectedError(`Level ${dinoz.level} doesn't exist.`);
	}
	const maxExperience = level.experience;

	if (dinoz.experience < maxExperience /*&& !event*/) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't have enough experience`);
	}

	// Check if dinoz has 'Plan de carrière' skill or cube object
	const hasCubeOrPdc =
		dinoz.skills.some(skill => skill.skillId === skillList[Skill.PLAN_DE_CARRIERE].id) ||
		(dinoz.items.some(item => item.itemId === itemList[Item.DINOZ_CUBE].itemId) && dinoz.level <= 10);

	if (tryNumber < 1 || tryNumber > 2 || (tryNumber === 2 && !hasCubeOrPdc)) {
		throw new ExpectedError(`tryNumber ${tryNumber} is invalid`);
	}

	const learnableElement = tryNumber === 1 ? dinoz.nextUpElementId : dinoz.nextUpAltElementId;

	return {
		learnableSkills: getLearnableSkills(dinoz, learnableElement),
		unlockableSkills: getUnlockableSkills(dinoz, learnableElement),
		canRelaunch: hasCubeOrPdc,
		element: learnableElement,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir,
		upChance: race.upChance,
		name: dinoz.name,
		display: dinoz.display,
		level: dinoz.level
	};
}
