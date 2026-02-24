import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { SkillTreeType } from '@dinorpg/core/models/enums/SkillTreeType.js';
import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { randomUUID } from 'crypto';

import { Dinoz, DinozSkills, DinozSkillsUnlockable, DinozStatus, Prisma } from '../../../../prisma/index.js';
import { GLOBAL } from '../../context.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { getRandomUpElement } from './getRandomUpElement.js';

export const getTreeType = (status: Pick<DinozStatus, 'statusId'>[]) => {
	return status.some(status => status.statusId === DinozStatusId.ETHER_DROP)
		? SkillTreeType.ETHER
		: SkillTreeType.VANILLA;
};

/**
 * Return all skills that a dinoz can learn (every elements).
 * If the param "elementWanted" is present, return learnable skills from one specific element.
 */
export const getLearnableSkills = (
	dinoz: Pick<Dinoz, 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) => {
	const treeType = getTreeType(dinoz.status);
	let learnableSkills = structuredClone(Object.values(skillList));

	// Keep all skills which have same type (fire, wood...)
	if (elementWanted !== undefined) {
		learnableSkills = learnableSkills.filter(skill => skill.element.some(element => element === elementWanted));
	}

	// First filter : Keep all skills from same tree (Vanilla or Ether)
	// Second filter : Keep all skills that are learnable or already learned
	// Third filter : Remove all skills that dinoz already knows
	// Fourth filter : Remove all unlockables skills
	// Fifth filter : Remove all spherical skills (not learnable here)
	// Sixth filtre : Remove race skills (ex : fly from Pteroz)
	return learnableSkills
		.filter(skill => skill.tree === treeType)
		.filter(skill =>
			skill.unlockedFrom?.every(skillId => dinoz.skills.some(dinozSkill => dinozSkill.skillId === skillId))
		)
		.filter(skill => !dinoz.skills.some(dinozSkill => dinozSkill.skillId === skill.id))
		.filter(skill => !dinoz.unlockableSkills.some(dinozSkill => dinozSkill.skillId === skill.id))
		.filter(skill => !skill.isSphereSkill)
		.filter(skill => !skill.raceId || skill.raceId.includes(dinoz.raceId))
		.map(skill => {
			return {
				skillId: skill.id,
				type: skill.type,
				element: skill.element
			};
		});
};

/**
 * Return all skills that a dinoz can unlock (every elements).
 * If the param "elementWanted" is present, return unlockable skills from one specific element.
 */
export const getUnlockableSkills = (
	dinoz: {
		status: Pick<DinozStatus, 'statusId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
	},
	elementWanted?: ElementType
) => {
	const treeType = getTreeType(dinoz.status);
	let unlockableSkills = dinoz.unlockableSkills.map(skill => {
		const foundSkill = Object.values(skillList).find(skills => skills.id === skill.skillId);

		if (!foundSkill) {
			throw new ExpectedError(`Skill ${skill} doesn't exist.`);
		}
		return foundSkill;
	});

	if (elementWanted !== undefined) {
		unlockableSkills = unlockableSkills.filter(skill => skill.element.some(element => element === elementWanted));
	}

	return unlockableSkills
		.filter(skill => skill.tree === treeType)
		.map(skill => {
			return {
				skillId: skill.id,
				element: skill.element
			};
		});
};

/**
 * Get up chance for one element
 * If the dinoz can't learn more skill from that element, return 0 -> Element can't be selected at next level.
 */
export const getElementUpChance = (
	learnableSkillsAllElements: Partial<SkillDetails>[],
	unlockableSkillsAllElements: Partial<SkillDetails>[],
	element: ElementType,
	elementValue: number
) => {
	return learnableSkillsAllElements.some(skill => skill.element?.includes(element)) ||
		unlockableSkillsAllElements.some(skill => skill.element?.includes(element))
		? elementValue
		: 0;
};

export const getDinozUpChance = (
	learnableSkills: {
		skillId: Skill;
		type: SkillType;
		element: ElementType[];
	}[],
	unlockableSkills: {
		skillId: Skill;
		element: ElementType[];
	}[],
	dinozRace: DinozRace
) => {
	return {
		fire: getElementUpChance(learnableSkills, unlockableSkills, ElementType.FIRE, dinozRace.upChance.fire),
		wood: getElementUpChance(learnableSkills, unlockableSkills, ElementType.WOOD, dinozRace.upChance.wood),
		water: getElementUpChance(learnableSkills, unlockableSkills, ElementType.WATER, dinozRace.upChance.water),
		lightning: getElementUpChance(
			learnableSkills,
			unlockableSkills,
			ElementType.LIGHTNING,
			dinozRace.upChance.lightning
		),
		air: getElementUpChance(learnableSkills, unlockableSkills, ElementType.AIR, dinozRace.upChance.air)
	};
};

export const reincarnateDinoz = (race: DinozRace, display: string): Prisma.DinozUpdateInput => {
	const fullDisplay = [...display];
	fullDisplay[1] = '0';

	let fire = 0;
	let water = 0;
	let wood = 0;
	let lightning = 0;
	let air = 0;
	for (let i = 0; i < 5; i++) {
		const element = getRandomUpElement(race.upChance);
		switch (element) {
			case 1:
				fire++;
				break;
			case 2:
				wood++;
				break;
			case 3:
				water++;
				break;
			case 4:
				lightning++;
				break;
			case 5:
				air++;
				break;
			default:
				break;
		}
	}
	// New destiny
	let seed = randomUUID();

	return {
		experience: 0,
		level: 1,
		nextUpElementId: getRandomUpElement(race.upChance, seed),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed),
		nbrUpFire: race.nbrFire + fire,
		nbrUpWood: race.nbrWood + wood,
		nbrUpWater: race.nbrWater + water,
		nbrUpLightning: race.nbrLightning + lightning,
		nbrUpAir: race.nbrAir + air,
		display: fullDisplay.toString().replaceAll(',', ''),
		maxLife: 100,
		placeId: PlaceEnum.DINOVILLE,
		life: 1,
		seed: seed
		//FBTournamentStep: 0
	};
};

export const useRice = async (
	dinoz: Pick<Dinoz, 'id' | 'level' | 'raceId'> & {
		status: Pick<DinozStatus, 'statusId'>[];
		skills: Pick<DinozSkills, 'skillId'>[];
		unlockableSkills: Pick<DinozSkillsUnlockable, 'skillId'>[];
	}
) => {
	const newDinozData: Prisma.DinozUpdateInput = {
		name: '?',
		experience: 0,
		canRename: true
	};

	if (dinoz.level === 1) {
		const dinozRace = Object.values(raceList).find(race => race.raceId === dinoz.raceId);

		if (!dinozRace) {
			throw new ExpectedError(`Dinoz race ${dinoz.raceId} doesn't exist.`);
		}

		const learnableSkills = getLearnableSkills(dinoz);
		const unlockableSkills = getUnlockableSkills(dinoz);
		const upChance = getDinozUpChance(learnableSkills, unlockableSkills, dinozRace);

		newDinozData.seed = randomUUID();
		newDinozData.nextUpElementId = getRandomUpElement(upChance, newDinozData.seed + GLOBAL.config.salt + dinoz.level);
		newDinozData.nextUpAltElementId = getRandomUpElement(
			upChance,
			newDinozData.seed + GLOBAL.config.salt + dinoz.level + 'pdc'
		);
	}
	await updateDinoz(dinoz.id, newDinozData);
};

export const learnNextSphereSkill = (
	dinoz: {
		skills: Pick<DinozSkills, 'skillId'>[];
	},
	element: ElementType
) => {
	const sphereSkills = Object.values(skillList)
		.filter(skill => skill.isSphereSkill)
		.filter(skill => skill.element.some(el => el === element));

	// Start with the first sphere skill, i.e the one that is unlocked from nothing
	let sphereSkillToLearn = sphereSkills.find(skill => skill.unlockedFrom && skill.unlockedFrom.length === 0);

	while (sphereSkillToLearn !== undefined) {
		if (!dinoz.skills.some(skill => skill.skillId === sphereSkillToLearn?.id)) {
			// SAFETY: sphereSkillToLearn is not undefined
			// If dinoz does not have the skill, then it is the next skill to learn
			break;
		} else {
			// Else the dinoz knows the skill already, so check the next skill that is unlocked from the current one
			sphereSkillToLearn = sphereSkills.find(
				skill => skill.unlockedFrom && skill.unlockedFrom.some(s => s === sphereSkillToLearn?.id)
			); // SAFETY: sphereSkillToLearn is not undefined
		}
	}

	if (!sphereSkillToLearn) {
		throw new ExpectedError('knownSphereSkill');
	}

	return sphereSkillToLearn?.id; // SAFETY: sphereSkillToLearn is not undefined
};
