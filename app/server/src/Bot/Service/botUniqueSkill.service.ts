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
