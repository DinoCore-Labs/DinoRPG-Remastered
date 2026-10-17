import { describe, expect, it } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';
import { getDefaultBotStrategy } from '../../src/Bot/Service/createBotPlayer.service.js';

describe('default bot strategy', () => {
	it('assigns the same default strategy to the same bot name', () => {
		expect(getDefaultBotStrategy('AlphaBot')).toBe(getDefaultBotStrategy('AlphaBot'));
	});

	it('distributes representative bot names across multiple strategies', () => {
		const strategies = new Set(
			['AlphaBot', 'BravoBot', 'CharlieBot', 'DeltaBot', 'EchoBot', 'FoxtrotBot', 'GolfBot', 'HotelBot'].map(
				getDefaultBotStrategy
			)
		);

		expect(strategies.size).toBeGreaterThan(1);
	});

	it('always resolves to a valid strategy', () => {
		expect(Object.values(BotStrategy)).toContain(getDefaultBotStrategy('StableBot'));
	});
});
