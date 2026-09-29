import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { Skill, skillList, uSkillsToPlayerFieldMap } from '@dinorpg/core/models/skills/skillList.js';

import type { User } from '../../../../prisma/index.js';

type UniqueSkillField =
	| 'leader'
	| 'engineer'
	| 'shopKeeper'
	| 'cooker'
	| 'merchant'
	| 'priest'
	| 'teacher'
	| 'messie'
	| 'matelasseur';

export const BOT_UNIQUE_SKILL_PRIORITY: Skill[] = [
	Skill.LEADER,
	Skill.MARCHAND,
	Skill.INGENIEUR,
	Skill.MAGASINIER,
	Skill.CUISINIER,
	Skill.PROFESSEUR,
	Skill.PRETRE,
	Skill.MESSIE,
	Skill.MATELASSEUR
];

function getUniqueSkillField(skillId: Skill): UniqueSkillField | null {
	return uSkillsToPlayerFieldMap.get(skillId) ?? null;
}

export function getMissingBotUniqueSkills(
	user: Pick<
		User,
		'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur'
	>
): Skill[] {
	return BOT_UNIQUE_SKILL_PRIORITY.filter(skillId => {
		const field = getUniqueSkillField(skillId);
		return field ? !user[field] : false;
	});
}

function isSkillOnPathToTarget(
	skillId: Skill,
	targetSkillId: Skill,
	visited = new Set<Skill>()
): boolean {
	if (skillId === targetSkillId) return true;
	if (visited.has(targetSkillId)) return false;
	visited.add(targetSkillId);

	const target = skillList[targetSkillId];
	if (!target?.unlockedFrom?.length) return false;

	return target.unlockedFrom.some(parentSkillId =>
		isSkillOnPathToTarget(skillId, parentSkillId as Skill, visited)
	);
}

export function getUniqueProgressionWeight(skillId: number, missingUniqueSkills: Skill[]): number {
	const typedSkillId = skillId as Skill;

	for (let index = 0; index < missingUniqueSkills.length; index += 1) {
		const target = missingUniqueSkills[index];
		if (!isSkillOnPathToTarget(typedSkillId, target)) continue;

		const priorityBonus = Math.max(0, 90 - index * 8);
		const directTargetBonus = typedSkillId === target ? 80 : 0;
		return priorityBonus + directTargetBonus;
	}

	return 0;
}


export type BotUniqueSkillDinozProfile = {
	id: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
};

function getElementAffinity(dinoz: BotUniqueSkillDinozProfile, skillId: Skill): number {
	const element = skillList[skillId]?.element?.[0];
	switch (element) {
		case ElementType.WOOD:
			return dinoz.nbrUpWood;
		case ElementType.WATER:
			return dinoz.nbrUpWater;
		case ElementType.LIGHTNING:
			return dinoz.nbrUpLightning;
		case ElementType.AIR:
			return dinoz.nbrUpAir;
		case ElementType.FIRE:
			return dinoz.nbrUpFire;
		default:
			return 0;
	}
}

export function assignBotUniqueSkillTargets(
	dinozList: BotUniqueSkillDinozProfile[],
	missingUniqueSkills: Skill[]
): Map<number, Skill[]> {
	const cohort = [...dinozList].sort((a, b) => a.id - b.id).slice(0, 3);
	const assignments = new Map<number, Skill[]>(cohort.map(dinoz => [dinoz.id, []]));

	for (const targetSkillId of missingUniqueSkills) {
		let bestDinoz: BotUniqueSkillDinozProfile | null = null;
		let bestScore = Number.NEGATIVE_INFINITY;

		for (const dinoz of cohort) {
			const assignedCount = assignments.get(dinoz.id)?.length ?? 0;
			const affinity = getElementAffinity(dinoz, targetSkillId);

			// Strongly prefer the Dinoz already progressing in the target element,
			// but spread account roles instead of stacking every unique skill on one Dinoz.
			const score = affinity * 12 - assignedCount * 18 - dinoz.id * 0.000001;
			if (score > bestScore) {
				bestScore = score;
				bestDinoz = dinoz;
			}
		}

		if (bestDinoz) {
			assignments.get(bestDinoz.id)?.push(targetSkillId);
		}
	}

	return assignments;
}
