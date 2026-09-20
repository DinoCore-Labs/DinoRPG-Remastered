import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { describe, expect, it } from 'vitest';

import { generateDinozDisplay } from '../../src/utils/dinoz/displayDinoz.js';

describe('generateDinozDisplay', () => {
	it('generates a 16-character display with the race prefix', () => {
		const race = raceList[RaceEnum.MOUEFFE];
		const display = generateDinozDisplay(race, '0', '0', '0');
		expect(display).toHaveLength(16);
		expect(display.startsWith(race.swfLetter)).toBe(true);
		expect(display.endsWith('000')).toBe(true);
		expect(display.slice(2, 13)).toMatch(/^[0-9A-Za-z]{11}$/);
	});

	it('preserves palette and rare visual attributes', () => {
		const race = raceList[RaceEnum.PIGMOU];
		const display = generateDinozDisplay(race, 'A', 'B', 'C');
		expect(display).toHaveLength(16);
		expect(display.startsWith(race.swfLetter)).toBe(true);
		expect(display.endsWith('ABC')).toBe(true);
	});
});
