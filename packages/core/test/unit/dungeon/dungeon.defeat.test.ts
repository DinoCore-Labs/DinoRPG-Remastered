import { describe, expect, it } from 'vitest';

import { isMtDungeonPartyWiped } from '../../../src/models/dungeon/dungeon.defeat.js';

describe('MT dungeon defeat: full-party wipe', () => {
	const party = [
		{ id: 17, leaderId: null, life: 0 },
		{ id: 18, leaderId: 17, life: 0 }
	];
	it('evacuates only when every member is knocked out', () => {
		expect(isMtDungeonPartyWiped(party, 17)).toBe(true);
		expect(isMtDungeonPartyWiped([{ ...party[0]!, life: 1 }, party[1]!], 17)).toBe(false);
		expect(isMtDungeonPartyWiped([party[0]!, { ...party[1]!, life: 1 }], 17)).toBe(false);
	});
	it('works for a lone Dinoz and with negative HP', () => {
		expect(isMtDungeonPartyWiped([{ id: 17, leaderId: null, life: -3 }], 17)).toBe(true);
	});
	it('fails closed for missing, detached or foreign leaders', () => {
		expect(isMtDungeonPartyWiped([], 17)).toBe(false);
		expect(isMtDungeonPartyWiped([party[1]!], 17)).toBe(false);
		expect(isMtDungeonPartyWiped([{ ...party[0]!, leaderId: 22 }, party[1]!], 17)).toBe(false);
		expect(isMtDungeonPartyWiped([...party, { id: 21, leaderId: 99, life: 0 }], 17)).toBe(false);
	});
});
