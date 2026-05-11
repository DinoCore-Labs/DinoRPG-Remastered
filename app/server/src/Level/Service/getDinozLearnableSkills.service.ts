import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxXp, isDinozBlockedByLevelLimit } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyRequest } from 'fastify';

import { Dinoz, DinozItems, DinozSkills, DinozSkillsUnlockable, DinozStatus, User } from '../../../../prisma/index.js';
import gameConfig from '../../config/game.config.js';
import { getLearnableSkills, getUnlockableSkills } from '../../utils/dinoz/level.mapper.js';

export function getDinozLearnableSkills(
	req: FastifyRequest,
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

	if (isDinozBlockedByLevelLimit(dinoz)) {
		throw new ExpectedError('dinozLevelCapReached', {
			statusCode: 400,
			params: {
				dinozId,
				level: dinoz.level
			}
		});
	}

	const maxExperience = getMaxXp(dinoz);

	if (dinoz.experience < maxExperience /*&& !event*/) {
		throw new ExpectedError('dinozNotEnoughExperience', {
			statusCode: 400,
			params: {
				dinozId
			}
		});
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
