import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { BotStrategy } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';
import { assignBotUniqueSkillTargets, getMissingBotUniqueSkills, getUniqueProgressionWeight } from './botUniqueSkill.service.js';
import { getDinozForLevelUp } from '../../Level/Controller/getDinozForLevelUp.controller.js';
import { getDinozLearnableSkills } from '../../Level/Service/getDinozLearnableSkills.service.js';

const GATHERER_SKILLS = new Set<number>([
	Skill.FOUILLE,
	Skill.EXPERT_EN_FOUILLE,
	Skill.APPRENTI_PECHEUR,
	Skill.PECHEUR_CONFIRME,
	Skill.MAITRE_PECHEUR,
	Skill.CUEILLETTE,
	Skill.GARDE_FORESTIER,
	Skill.ARCHEOLOGUE
]);

const EXPLORER_SKILLS = new Set<number>([
	Skill.SPRINT,
	Skill.SURVIE,
	Skill.MAITRE_NAGEUR,
	Skill.MAITRE_LEVITATEUR,
	Skill.DEPLACEMENT_INSTANTANE,
	Skill.ENDURANCE,
	Skill.VITALITE
]);

function getSkillWeight(skillId: number, strategy: BotStrategy, uniqueProgressionWeight = 0): number {
	const skill = skillList[skillId as Skill];
	if (!skill) return 1;

	let weight = 10 + uniqueProgressionWeight;

	switch (strategy) {
		case BotStrategy.FIGHTER:
			if (skill.activatable) weight += 12;
			if (skill.effects && Object.keys(skill.effects).length > 0) weight += 8;
			break;
		case BotStrategy.GATHERER:
			if (GATHERER_SKILLS.has(skillId)) weight += 30;
			break;
		case BotStrategy.EXPLORER:
			if (EXPLORER_SKILLS.has(skillId)) weight += 30;
			break;
		case BotStrategy.BALANCED:
		default:
			if (skill.activatable) weight += 4;
			if (skill.effects && Object.keys(skill.effects).length > 0) weight += 4;
			break;
	}

	return weight;
}

function weightedPick(
	skillIds: number[],
	strategy: BotStrategy,
	uniqueProgressionWeights: Map<number, number>
): number {
	const entries = skillIds.map(skillId => ({
		skillId,
		weight: getSkillWeight(skillId, strategy, uniqueProgressionWeights.get(skillId) ?? 0)
	}));
	const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
	let cursor = Math.random() * total;

	for (const entry of entries) {
		cursor -= entry.weight;
		if (cursor <= 0) return entry.skillId;
	}

	return entries[entries.length - 1].skillId;
}

export async function chooseBotLevelUp(
	dinozId: number,
	strategy: BotStrategy
): Promise<{ skillIdList: number[]; tryNumber: number }> {
	const dinoz = await getDinozForLevelUp(dinozId);
	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	const race = Object.values(raceList).find(entry => entry.raceId === dinoz.raceId);
	if (!race) {
		throw new ExpectedError('dinozRaceNotFound', { params: { raceId: dinoz.raceId } });
	}

	const tryNumber = 1;
	const choices = getDinozLearnableSkills(dinoz, race, dinozId, tryNumber);

	const user = await prisma.user.findUnique({
		where: { id: dinoz.user.id },
		select: {
			leader: true,
			engineer: true,
			shopKeeper: true,
			cooker: true,
			merchant: true,
			priest: true,
			teacher: true,
			messie: true,
			matelasseur: true
		}
	});
	const missingUniqueSkills = user ? getMissingBotUniqueSkills(user) : [];
	const firstDinoz = await prisma.dinoz.findMany({
		where: { userId: dinoz.user.id },
		orderBy: { id: 'asc' },
		take: 3,
		select: {
			id: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true
		}
	});
	const assignments = assignBotUniqueSkillTargets(firstDinoz, missingUniqueSkills);
	const assignedUniqueSkills = assignments.get(dinozId) ?? [];
	const uniqueProgressionWeights = new Map<number, number>(
		choices.learnableSkills.map(skill => [
			skill.skillId,
			getUniqueProgressionWeight(skill.skillId, assignedUniqueSkills)
		])
	);

	if (choices.learnableSkills.length > 0) {
		return {
			skillIdList: [weightedPick(choices.learnableSkills.map(skill => skill.skillId), strategy, uniqueProgressionWeights)],
			tryNumber
		};
	}

	if (choices.unlockableSkills.length > 0) {
		return {
			skillIdList: choices.unlockableSkills.map(skill => skill.skillId),
			tryNumber
		};
	}

	throw new ExpectedError('noBotLevelUpChoice', { params: { dinozId } });
}
