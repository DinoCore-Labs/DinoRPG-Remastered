import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { describe, expect, it } from 'vitest';

import { BotDinozRole, BotRoleObjective } from '../../../prisma/index.js';
import {
	assignBotUniqueSkillTargets,
	getRoleObjectiveSkillWeight,
	getUniqueProgressionWeight
} from '../../src/Bot/Service/botUniqueSkill.service.js';

describe('bot unique skill strategy', () => {
	it('assigns Leader to the fighter and Marchand to the gatherer', () => {
		const assignments = assignBotUniqueSkillTargets(
			[
				{
					id: 1,
					nbrUpFire: 0,
					nbrUpWood: 2,
					nbrUpWater: 0,
					nbrUpLightning: 12,
					nbrUpAir: 0,
					role: BotDinozRole.FIGHTER
				},
				{
					id: 2,
					nbrUpFire: 0,
					nbrUpWood: 0,
					nbrUpWater: 0,
					nbrUpLightning: 1,
					nbrUpAir: 0,
					role: BotDinozRole.GATHERER
				},
				{
					id: 3,
					nbrUpFire: 0,
					nbrUpWood: 8,
					nbrUpWater: 0,
					nbrUpLightning: 8,
					nbrUpAir: 0,
					role: BotDinozRole.EXPLORER
				}
			],
			[Skill.LEADER, Skill.MARCHAND]
		);

		expect(assignments.get(1)).toContain(Skill.LEADER);
		expect(assignments.get(2)).toContain(Skill.MARCHAND);
		expect(assignments.get(3)).not.toContain(Skill.MARCHAND);
	});

	it('recognizes Paratonnerre and Fission elementaire as part of the Marchand path', () => {
		expect(getUniqueProgressionWeight(Skill.PARATONNERRE, [Skill.MARCHAND])).toBeGreaterThan(0);
		expect(getUniqueProgressionWeight(Skill.FISSION_ELEMENTAIRE, [Skill.MARCHAND])).toBeGreaterThan(0);
		expect(getUniqueProgressionWeight(Skill.MARCHAND, [Skill.MARCHAND])).toBeGreaterThan(
			getUniqueProgressionWeight(Skill.FISSION_ELEMENTAIRE, [Skill.MARCHAND])
		);
	});

	it('strongly reinforces the Marchand path while it is the gatherer objective', () => {
		expect(getRoleObjectiveSkillWeight(Skill.PARATONNERRE, BotRoleObjective.GATHERER_MERCHANT)).toBeGreaterThan(0);
		expect(getRoleObjectiveSkillWeight(Skill.FISSION_ELEMENTAIRE, BotRoleObjective.GATHERER_MERCHANT)).toBeGreaterThan(0);
		expect(getRoleObjectiveSkillWeight(Skill.MARCHAND, BotRoleObjective.GATHERER_MERCHANT)).toBeGreaterThan(
			getRoleObjectiveSkillWeight(Skill.FISSION_ELEMENTAIRE, BotRoleObjective.GATHERER_MERCHANT)
		);
		expect(getRoleObjectiveSkillWeight(Skill.FOUILLE, BotRoleObjective.GATHERER_MERCHANT)).toBe(0);
		expect(getRoleObjectiveSkillWeight(Skill.PARATONNERRE, BotRoleObjective.GATHERER_HARVEST)).toBe(0);
	});

});
