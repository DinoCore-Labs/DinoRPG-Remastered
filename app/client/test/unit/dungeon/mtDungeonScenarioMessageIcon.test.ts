import { describe, expect, it } from 'vitest';

import { mtDungeonScenarioMessageIcon } from '../../../src/components/dungeon/mtDungeonScenarioMessageIcon.js';

describe('MT dungeon scenario message icons', () => {
	it('shows the original map scroll for Mandragore page 1 when msg_icon=misc is unavailable', () => {
		expect(mtDungeonScenarioMessageIcon('stepp_0', 0, 'misc')).toBe('scroll');
	});

	it('uses the chest icon for a chest scenario whose msg_icon=misc is unavailable', () => {
		expect(mtDungeonScenarioMessageIcon('stepp_3', 1, 'misc')).toBe('chest');
	});

	it('uses the original skeleton icon when no message icon was specified', () => {
		expect(mtDungeonScenarioMessageIcon('stepp_1', 2, null)).toBe('skel');
	});

	it('prefers a known message icon over the scene icon', () => {
		expect(mtDungeonScenarioMessageIcon('stepp_0', 0, 'chest')).toBe('chest');
	});

	it('does not invent a sprite for invalid or unknown scenarios', () => {
		expect(mtDungeonScenarioMessageIcon('stepp_0', 1000, 'misc')).toBeNull();
		expect(mtDungeonScenarioMessageIcon('invalid', 0, 'misc')).toBeNull();
	});
});
