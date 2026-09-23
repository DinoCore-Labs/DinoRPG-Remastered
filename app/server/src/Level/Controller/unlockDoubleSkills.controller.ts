import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { addMultipleUnlockableSkills } from '../../Dinoz/Controller/addMultipleSkill.controller.js';
import { getDinozSkillsLearnableAndUnlockable } from '../../Dinoz/Controller/getDinozSkillsLearnableAndUnlockable.controller.js';
import { prisma } from '../../prisma.js';
import { getLearnableSkills } from '../../utils/dinoz/level.mapper.js';

type UnlockDoubleSkillDb = Pick<typeof prisma, 'dinoz' | 'dinozSkillsUnlockable'>;

export async function unlockDoubleSkills(dinozId: number, db: UnlockDoubleSkillDb = prisma) {
	const dinoz = await getDinozSkillsLearnableAndUnlockable(dinozId, db);
	if (!dinoz) {
		throw new ExpectedError(`Dinoz ${dinozId} doesn't exist.`);
	}
	const allLearnableSkills = getLearnableSkills(dinoz);
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
	await addMultipleUnlockableSkills(doubleSkillsToUnlock, db);
}
