import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { addMultipleUnlockableSkills } from '../../Dinoz/Controller/addMultipleSkill.controller.js';
import { getDinozSkillsLearnableAndUnlockable } from '../../Dinoz/Controller/getDinozSkillsLearnableAndUnlockable.controller.js';
import { getLearnableSkills } from '../../utils/dinoz/level.mapper.js';

/**
 * Function used when the dinoz learn "Double skill".
 * Get all double skills that dinoz can learn et place it into unlockable_skills table.
 */
export async function unlockDoubleSkills(dinozId: number) {
	const dinoz = await getDinozSkillsLearnableAndUnlockable(dinozId);
	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}
	const allLearnableSkills = getLearnableSkills(dinoz);

	// First filter : Get all skills which have more that one element (ex : fire and water).
	// Second filter : Assert that the skill is a double skill, and not an invocation or something else.
	const doubleSkillsToUnlock = allLearnableSkills
		.filter(skill => (skill.element?.length || 0) > 1)
		.filter(skillToUnlock => {
			const skillDetail = Object.values(skillList).find(skill => skill.id === skillToUnlock.skillId);
			return skillDetail?.unlockedFrom?.includes(skillList[Skill.COMPETENCE_DOUBLE].id);
		})
		.map(skill => ({
			skillId: skill.skillId,
			dinozId
		}));

	await addMultipleUnlockableSkills(doubleSkillsToUnlock);
}
