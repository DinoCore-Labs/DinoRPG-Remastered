import { describe, expect, it } from 'vitest';

import { applyMtDungeonPickup, type MtExplorerState } from '../../../src/models/dungeon/dungeon.exploration.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

const map: DungeonStructure = {
	width: 4,
	height: 4,
	levels: [
		{
			table: Array.from({ length: 4 }, () => Array(4).fill(true) as boolean[]),
			rooms: [
				{
					id: 0,
					x: 0,
					y: 0,
					w: 4,
					h: 4,
					doors: [],
					item: { x: 2, y: 1, kind: 'IKey', value: 2 }
				}
			]
		}
	],
	start: { x: 0, y: 0, l: 0 },
	exit: { x: 3, y: 3, l: 0 }
};

function explorer(keys: boolean[] = []): MtExplorerState {
	return { position: { x: 2, y: 1, l: 0 }, keys, flags: new Set<number>(), locked: false, fog: null };
}

describe('MT key pickup: dense persistence-safe boolean array', () => {
	it('pads missing key slots with false when collecting key 2', () => {
		const initial = explorer();
		const result = applyMtDungeonPickup(map, initial);
		expect(result.keys).toEqual([false, false, true]);
		expect(result.keys.every(value => typeof value === 'boolean')).toBe(true);
		expect(result.flags.has(getMtFlagIndex(map, 0, 2, 1))).toBe(true);
		expect(initial.keys).toEqual([]);
		expect(initial.flags.size).toBe(0);
	});

	it('preserves a previously held key without creating sparse slots', () => {
		const result = applyMtDungeonPickup(map, explorer([true]));
		expect(result.keys).toEqual([true, false, true]);
		const repeated = applyMtDungeonPickup(map, result);
		expect(repeated.keys).toEqual([true, false, true]);
	});
});
