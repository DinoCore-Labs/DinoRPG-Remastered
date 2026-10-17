import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { describe, expect, it } from 'vitest';

import { BotDinozRole, BotRoleObjective } from '../../../prisma/index.js';
import { getBotRoleSkillWeight } from '../../src/Bot/Service/botLevelUp.service.js';

describe('bot level-up role strategy', () => {
	it('strongly favors combat skills for fighter Dinoz', () => {
		expect(
			getBotRoleSkillWeight(Skill.METEORES, BotDinozRole.FIGHTER, BotRoleObjective.FIGHTER_POWER)
		).toBeGreaterThan(
			getBotRoleSkillWeight(Skill.FOUILLE, BotDinozRole.FIGHTER, BotRoleObjective.FIGHTER_POWER)
		);
	});

	it('strongly favors harvesting skills for gatherer Dinoz after Marchand', () => {
		expect(
			getBotRoleSkillWeight(Skill.FOUILLE, BotDinozRole.GATHERER, BotRoleObjective.GATHERER_HARVEST)
		).toBeGreaterThan(
			getBotRoleSkillWeight(Skill.METEORES, BotDinozRole.GATHERER, BotRoleObjective.GATHERER_HARVEST)
		);
	});

	it('strongly favors mobility and survival skills for explorer Dinoz', () => {
		expect(
			getBotRoleSkillWeight(Skill.SPRINT, BotDinozRole.EXPLORER, BotRoleObjective.EXPLORER_DISCOVERY)
		).toBeGreaterThan(
			getBotRoleSkillWeight(Skill.FOUILLE, BotDinozRole.EXPLORER, BotRoleObjective.EXPLORER_DISCOVERY)
		);
	});

	it('keeps role weighting neutral when a persistent role is unavailable', () => {
		expect(getBotRoleSkillWeight(Skill.METEORES, null, null)).toBe(0);
	});
});
