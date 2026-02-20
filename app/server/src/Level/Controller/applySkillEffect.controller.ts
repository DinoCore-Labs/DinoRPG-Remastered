import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Dinoz } from '../../../../prisma/index.js';
import { getAllDinozFromAccount } from '../../Dinoz/Controller/getAllDinozFromAccount.controller.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { getUserUniqueSkills } from '../../User/Controller/getUserUniqueSkills.controller.js';
import { setUser } from '../../User/Controller/setUser.controller.js';
import { applySkillToDinoz, applyUSkillEffect, computeUSkillEffects } from '../../utils/dinoz/skillParser.js';

export async function applySkillEffect(
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>,
	skill: SkillDetails,
	userId: string
	//event?: GameDinozUsage
) {
	if (skill.effects) {
		const updates = applySkillToDinoz(skill.effects, dinoz);
		/*if (event) {
			await updateEventDinoz(dinoz.id, updates);
		} else {*/
		await updateDinoz(dinoz.id, updates);
		//}
	}
	if (userId && skill.type === SkillType.U /*&& !event*/) {
		const user = await getUserUniqueSkills(userId);
		if (!user) {
			throw new ExpectedError(`This player doesn't exist.`);
		}
		applyUSkillEffect(user, skill);
		await setUser(userId, user);
	}
}

export async function computeUSkillsForUser(userId: string) {
	// Get player with its U skills
	const user = await getUserUniqueSkills(userId);
	if (!user) {
		throw new ExpectedError(`This player doesn't exist.`);
	}
	// Get player dinoz list
	const dinozList = await getAllDinozFromAccount(userId);
	const skills = dinozList.flatMap(dinoz => dinoz.skills).map(skill => skill.skillId);
	// Compute player U skills using dinoz skills
	computeUSkillEffects(user, skills);
	await setUser(userId, user);
}
