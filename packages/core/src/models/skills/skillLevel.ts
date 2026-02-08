import { Skill, skillList } from './skillList.js';

const getSkillLevel = (skill: Skill) => {
	let level = skill === Skill.LIMITE_BRISEE ? 10 : 1;

	const prerequisites = skillList[skill].unlockedFrom;
	if (prerequisites) {
		for (const prerequisite of prerequisites) {
			level += getSkillLevel(prerequisite);
		}
	}

	return level;
};

export const SkillLevel = Object.values(skillList).reduce(
	(acc, skill) => {
		acc[skill.id] = getSkillLevel(skill.id);
		return acc;
	},
	{} as Record<Skill, number>
);
