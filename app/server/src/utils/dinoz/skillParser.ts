import { Stat } from '@dinorpg/core/models/enums/SkillStat.js';
import { EffectDescriptor, PassiveEffects, SkillDetails } from '@dinorpg/core/models/skills/skillDetails.js';
//import { Skill, uSkillsToPlayerFieldMap } from '@dinorpg/core/models/skills/skillList.js';
import { operatorProcess } from '@dinorpg/core/models/utils/operatorProcess.js';

import { Dinoz /*User*/ } from '../../../../prisma/index.js';

function applySkillToDinoz(
	effects: PassiveEffects,
	dinoz: Pick<Dinoz, 'id' | 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>
	//event?: GameDinozUsage
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife = operatorProcess(dinoz.maxLife, value as EffectDescriptor);
				break;
			case Stat.FIRE_ELEMENT:
				dinoz.nbrUpFire = operatorProcess(dinoz.nbrUpFire, value as EffectDescriptor);
				break;
			case Stat.WATER_ELEMENT:
				dinoz.nbrUpWater = operatorProcess(dinoz.nbrUpWater, value as EffectDescriptor);
				break;
			case Stat.WOOD_ELEMENT:
				dinoz.nbrUpWood = operatorProcess(dinoz.nbrUpWood, value as EffectDescriptor);
				break;
			case Stat.AIR_ELEMENT:
				dinoz.nbrUpAir = operatorProcess(dinoz.nbrUpAir, value as EffectDescriptor);
				break;
			case Stat.LIGHTNING_ELEMENT:
				dinoz.nbrUpLightning = operatorProcess(dinoz.nbrUpLightning, value as EffectDescriptor);
				break;
			default:
				break;
		}
	}
	return {
		maxLife: dinoz.maxLife,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir
	};
}

function deApplySkillFromDinoz(
	effects: PassiveEffects,
	dinoz: Pick<Dinoz, 'maxLife' | 'nbrUpFire' | 'nbrUpAir' | 'nbrUpLightning' | 'nbrUpWater' | 'nbrUpWood'>
) {
	for (const [stat, value] of Object.entries(effects)) {
		switch (stat) {
			case Stat.MAX_HP:
				dinoz.maxLife -= +value;
				break;
			case Stat.FIRE_ELEMENT:
				dinoz.nbrUpFire -= +value;
				break;
			case Stat.WATER_ELEMENT:
				dinoz.nbrUpWater -= +value;
				break;
			case Stat.WOOD_ELEMENT:
				dinoz.nbrUpWood -= +value;
				break;
			case Stat.AIR_ELEMENT:
				dinoz.nbrUpAir -= +value;
				break;
			case Stat.LIGHTNING_ELEMENT:
				dinoz.nbrUpLightning -= +value;
				break;
			default:
				break;
		}
	}

	return {
		maxLife: dinoz.maxLife,
		nbrUpFire: dinoz.nbrUpFire,
		nbrUpWood: dinoz.nbrUpWood,
		nbrUpWater: dinoz.nbrUpWater,
		nbrUpLightning: dinoz.nbrUpLightning,
		nbrUpAir: dinoz.nbrUpAir
	};
}

/*function applyUSkillEffect(
	user: Pick<
		User,
		'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur'
	>,
	skill: SkillDetails
) {
	switch (skill.id) {
		case Skill.LEADER:
			if (!user.leader) user.leader = true;
			break;
		case Skill.INGENIEUR:
			if (!user.engineer) user.engineer = true;
			break;
		case Skill.MAGASINIER:
			if (!user.shopKeeper) user.shopKeeper = true;
			break;
		case Skill.CUISINIER:
			if (!user.cooker) user.cooker = true;
			break;
		case Skill.MARCHAND:
			if (!user.merchant) user.merchant = true;
			break;
		case Skill.PRETRE:
			if (!user.priest) user.priest = true;
			break;
		case Skill.PROFESSEUR:
			if (!user.teacher) user.teacher = true;
			break;
		case Skill.MESSIE:
			if (!user.messie) user.messie = true;
			break;
		case Skill.MATELASSEUR:
			if (!user.matelasseur) user.matelasseur = true;
			break;
		default:
			break;
	}
}*/

/**
 * Set player U skills based on given skills
 *
 * @param player the player to update
 * @param skills the skills to compute U skills
 */
/*function computeUSkillEffects(
	user: Pick<
		User,
		'leader' | 'engineer' | 'shopKeeper' | 'cooker' | 'merchant' | 'priest' | 'teacher' | 'messie' | 'matelasseur'
	>,
	skills: Skill[]
) {
	uSkillsToPlayerFieldMap.forEach((field, skill) => {
		user[field] = Boolean(skills.find(s => s === skill));
	});
}*/

export { applySkillToDinoz, /*applyUSkillEffect, computeUSkillEffects,*/ deApplySkillFromDinoz };
