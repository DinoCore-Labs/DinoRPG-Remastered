//import { SkillType } from '@dinorpg/core/models/enums/SkillType.js';
import { SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';

//import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { Dinoz } from '../../../../prisma/index.js';
import { updateDinoz } from '../../Dinoz/Controller/updateDinoz.controller.js';
import { applySkillToDinoz } from '../../utils/dinoz/skillParser.js';

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
	/*if (userId && skill.type === SkillType.U && !event) {
		const player = await getPlayerUSkills(userId);
		if (!player) {
			throw new ExpectedError(`This player doesn't exist.`);
		}
		applyUSkillEffect(player, skill);
		await setPlayer(playerId, player);
	}*/
}
