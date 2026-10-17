import { describe, expect, it } from 'vitest';

import { BotDinozRole, BotStrategy } from '../../../prisma/index.js';
import { getBotForcebrutPolicy } from '../../src/Bot/Service/botForcebrut.service.js';

describe('bot Forcebrut policy', () => {
	it('uses fighter tolerance for a fighter Dinoz even on a gatherer account strategy', () => {
		const policy = getBotForcebrutPolicy(BotStrategy.GATHERER, BotDinozRole.FIGHTER);

		expect(policy.maxOpponentLevelDelta).toBe(4);
		expect(policy.minLifeRatio).toBe(0.5);
		expect(policy.minIrmaQuantity).toBe(1);
	});

	it('keeps gatherer Dinoz conservative even on a fighter account strategy', () => {
		const policy = getBotForcebrutPolicy(BotStrategy.FIGHTER, BotDinozRole.GATHERER);

		expect(policy.maxOpponentLevelDelta).toBe(0);
		expect(policy.minLifeRatio).toBe(0.7);
		expect(policy.minIrmaQuantity).toBe(3);
	});

	it('falls back to the account strategy when no persistent role exists', () => {
		expect(getBotForcebrutPolicy(BotStrategy.BALANCED, null)).toEqual({
			minLifeRatio: 0.6,
			maxOpponentLevelDelta: 2,
			minIrmaQuantity: 2
		});
	});
});
