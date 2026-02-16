import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getMaxXp } from '@dinorpg/core/utils/dinozUtils.js';

import { Dinoz, DinozSkills, DinozSkillsUnlockable, DinozStatus } from '../../../../prisma/index.js';
import { GLOBAL } from '../../context.js';
import { fromBase62 } from '../../utils/dinoz/displayDinoz.js';
import { getRandomUpElement } from '../../utils/dinoz/getRandomUpElement.js';
import { getDinozUpChance, getLearnableSkills, getUnlockableSkills } from '../../utils/dinoz/level.mapper.js';

// Get dinoz updated data when level up is over.
export function getNewDinozDataFromLevelUp(
	dinozId: number,
	tryNumber: number,
	dinozSkills: Pick<
		Dinoz,
		| 'raceId'
		| 'level'
		| 'nextUpElementId'
		| 'nextUpAltElementId'
		| 'nbrUpFire'
		| 'nbrUpWood'
		| 'nbrUpWater'
		| 'nbrUpLightning'
		| 'nbrUpAir'
		| 'display'
		| 'experience'
		| 'seed'
	> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
	},
	dinozRace: DinozRace
) {
	const maxXp = getMaxXp(dinozSkills);
	const allLearnableSkills = getLearnableSkills(dinozSkills);

	const allUnlockableSkills = getUnlockableSkills(dinozSkills);

	const upChance = getDinozUpChance(allLearnableSkills, allUnlockableSkills, dinozRace);

	const dinoz = {
		id: dinozId,
		experience: dinozSkills.experience - maxXp,
		level: dinozSkills.level + 1,
		nextUpElementId: getRandomUpElement(upChance, dinozSkills.seed + GLOBAL.config.salt + dinozSkills.level),
		nextUpAltElementId: getRandomUpElement(upChance, dinozSkills.seed + GLOBAL.config.salt + dinozSkills.level + 'pdc'),
		nbrUpFire: dinozSkills.nbrUpFire,
		nbrUpWood: dinozSkills.nbrUpWood,
		nbrUpWater: dinozSkills.nbrUpWater,
		nbrUpLightning: dinozSkills.nbrUpLightning,
		nbrUpAir: dinozSkills.nbrUpAir,
		display: dinozSkills.display
	};

	// Elements
	const nextUpElementId = tryNumber === 1 ? dinozSkills.nextUpElementId : dinozSkills.nextUpAltElementId;

	switch (nextUpElementId) {
		case ElementType.FIRE:
			dinoz.nbrUpFire = dinozSkills.nbrUpFire + 1;
			break;
		case ElementType.WOOD:
			dinoz.nbrUpWood = dinozSkills.nbrUpWood + 1;
			break;
		case ElementType.WATER:
			dinoz.nbrUpWater = dinozSkills.nbrUpWater + 1;
			break;
		case ElementType.LIGHTNING:
			dinoz.nbrUpLightning = dinozSkills.nbrUpLightning + 1;
			break;
		case ElementType.AIR:
			dinoz.nbrUpAir = dinozSkills.nbrUpAir + 1;
			break;
		default:
			throw new ExpectedError(`Up type is not valid !`);
	}

	// Display
	let growthLetter = fromBase62(dinozSkills.display[1]) % 10;

	if (dinozSkills.level < 10 && dinozSkills.display[1] !== 'A') {
		growthLetter++;
		dinoz.display =
			dinozSkills.display[0] + growthLetter + dinozSkills.display.substring(2, dinozSkills.display.length);
	}

	return dinoz;
}
