import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';
import { FastifyReply, FastifyRequest } from 'fastify';

import { computeUSkillsForUser } from '../../Level/Controller/applySkillEffect.controller.js';
import { updatePoints } from '../../Ranking/Controller/updatePoints.js';
import { reincarnateDinoz } from '../../utils/dinoz/level.mapper.js';
import {
	removeAllSkillFromDinoz,
	removeAllUnlockableSkillsFromDinoz
} from '../Controller/addMultipleSkill.controller.js';
import { addSkillToDinoz } from '../Controller/addSkillToDinoz.controller.js';
import { addStatusToDinoz, removeAllStatusFromDinoz } from '../Controller/dinozStatus.controller.js';
import { getDinozToReincarnate } from '../Controller/getDinozToReincarnate.controller.js';
import { updateDinoz } from '../Controller/updateDinoz.controller.js';

type Params = {
	id: string;
};

export async function reincarnate(req: FastifyRequest<{ Params: Params }>, _reply: FastifyReply) {
	const dinozId = +req.params.id;
	const authed = req.user;

	const dinoz = await getDinozToReincarnate(dinozId);

	if (!dinoz) {
		throw new ExpectedError('dinozNotFound', { params: { id: dinozId } });
	}

	if (
		!dinoz.skills.some(s => s.skillId === Skill.REINCARNATION) ||
		dinoz.level < 40 ||
		dinoz.status.some(s => s.statusId === DinozStatusId.REINCARNATION)
	) {
		throw new ExpectedError('reincarnationNotPossible', { params: { id: dinozId } });
	}

	// 🔎 Check if the dinoz has any equipped items before reincarnation and prevent reincarnation if it has any
	const equippedItems = dinoz.items.filter(i => i.itemId);
	if (equippedItems && equippedItems.length > 0) {
		throw new ExpectedError('reincarnationWithEquippedItems', { params: { id: dinozId } });
	}

	const race = getRace(dinoz.raceId);

	await updateDinoz(dinoz.id, reincarnateDinoz(race, dinoz.display));

	// Note: remove all skills *before*  going through the promises because the removal may conflict with adding back the race native skills.
	await removeAllSkillFromDinoz(dinoz.id);

	const promises = [];
	if (race.skillId && race.skillId.length > 0) {
		for (const skill of race.skillId) {
			promises.push(addSkillToDinoz(dinoz.id, skill));
		}
	}
	promises.push(removeAllStatusFromDinoz(dinoz.id));
	//promises.push(removeAllMissionsFromDinoz(dinoz.id));
	promises.push(removeAllUnlockableSkillsFromDinoz(dinoz.id));
	promises.push(updatePoints(authed.id, -dinoz.level));
	promises.push(computeUSkillsForUser(authed.id));
	await Promise.all(promises);

	await addStatusToDinoz(dinozId, DinozStatusId.REINCARNATION);
}
