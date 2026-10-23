import { describe, expect, it } from 'vitest';

import { consumeMtHealOnDeparture, isActiveMtHealZone } from '../../../src/models/dungeon/dungeon.healZone.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

const map: DungeonStructure = {
	width: 4,
	height: 4,
	start: { x: 1, y: 1, l: 0 },
	exit: { x: 3, y: 3, l: 0 },
	levels: [
		{
			table: Array.from({ length: 4 }, () => Array<boolean>(4).fill(true)),
			rooms: [{ id: 0, x: 0, y: 0, w: 4, h: 4, doors: [], item: { kind: 'IHeal', x: 2, y: 1, value: 0 } }]
		}
	]
};
const on = { x: 2, y: 1, l: 0 };
const other = { x: 1, y: 1, l: 0 };
const flag = getMtFlagIndex(map, 0, 2, 1);

describe('Remastered IHeal manual healing window', () => {
	it('stays active on arrival and for any number of items used without movement', () => {
		expect(isActiveMtHealZone(map, on, [])).toBe(true);
		expect(consumeMtHealOnDeparture(map, on, on, [])).toEqual([]);
		expect(isActiveMtHealZone(map, other, [])).toBe(false);
	});
	it('consumes only on successful departure, once, and never reactivates on return', () => {
		const flags = consumeMtHealOnDeparture(map, on, other, []);
		expect(flags).toEqual([flag]);
		expect(isActiveMtHealZone(map, on, flags)).toBe(false);
		expect(consumeMtHealOnDeparture(map, on, other, flags)).toEqual([flag]);
	});
	it('rejects an arbitrary flag as evidence of an original heal tile', () => {
		expect(isActiveMtHealZone(map, other, [])).toBe(false);
		expect(isActiveMtHealZone(map, on, [flag])).toBe(false);
	});
});
