import { describe, expect, it } from 'vitest';

import { BotDinozRole, BotRoleObjective } from '../../../prisma/index.js';
import { getBotHealingThreshold } from '../../src/Bot/Service/botHealing.service.js';

describe('bot healing strategy', () => {
	it('lets fighters tolerate lower life than gatherers and explorers', () => {
		const fighter = getBotHealingThreshold(
			BotDinozRole.FIGHTER,
			BotRoleObjective.FIGHTER_POWER,
			0
		);
		const gatherer = getBotHealingThreshold(
			BotDinozRole.GATHERER,
			BotRoleObjective.GATHERER_HARVEST,
			0
		);
		const explorer = getBotHealingThreshold(
			BotDinozRole.EXPLORER,
			BotRoleObjective.EXPLORER_DISCOVERY,
			0
		);

		expect(fighter).toBeLessThan(explorer);
		expect(explorer).toBeLessThan(gatherer);
	});

	it('becomes more cautious in zones remembered as dangerous', () => {
		const normal = getBotHealingThreshold(
			BotDinozRole.FIGHTER,
			BotRoleObjective.FIGHTER_POWER,
			20
		);
		const dangerous = getBotHealingThreshold(
			BotDinozRole.FIGHTER,
			BotRoleObjective.FIGHTER_POWER,
			-70
		);

		expect(dangerous).toBeGreaterThan(normal);
	});

	it('caps conservative healing so a bot does not over-heal constantly', () => {
		expect(
			getBotHealingThreshold(
				BotDinozRole.GATHERER,
				BotRoleObjective.GATHERER_HARVEST,
				-90
			)
		).toBe(0.7);
	});
});
