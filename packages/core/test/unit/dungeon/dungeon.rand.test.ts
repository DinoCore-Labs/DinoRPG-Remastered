import { describe, expect, it } from 'vitest';

import { mtDungeonTileFrame, MtRand } from '../../../src/models/dungeon/dungeon.rand.js';

/** Reference vectors independently calculated from archived libs-haxe2/mt/Rand.hx. */
describe('Motion Twin mt.Rand (Flash9)', () => {
	for (const [seed, expected] of [
		[0, [1, 1, 0, 1, 2, 0, 9]],
		[1, [4, 4, 0, 0, 2, 1, 7]],
		[29, [0, 4, 0, 1, 2, 0, 4]],
		[123, [4, 3, 0, 1, 6, 2, 10]],
		[900, [1, 2, 0, 0, 2, 1, 11]],
		[-30, [1, 3, 0, 0, 4, 1, 9]]
	] as const) {
		it(`reproduces seed ${seed}`, () => {
			const rand = new MtRand(0);
			rand.initSeed(seed);
			expect([5, 6, 1, 2, 7, 3, 16].map(n => rand.random(n))).toEqual([...expected]);
		});
	}

	it('selects the ground before wall frames using different frame counts', () => {
		// Reference seed 0: random(5)->1; random(6)->1; random(1)->0.
		expect(mtDungeonTileFrame(0, [5])).toBe(2);
		expect(mtDungeonTileFrame(0, [5, 6])).toBe(2);
		expect(mtDungeonTileFrame(0, [5, 6, 1])).toBe(1);
		expect(mtDungeonTileFrame(29, [5, 6])).toBe(5);
	});

	it('does not accept invalid frame group sizes', () => {
		expect(() => mtDungeonTileFrame(0, [])).toThrow();
		expect(() => mtDungeonTileFrame(0, [0])).toThrow(RangeError);
		expect(() => new MtRand(0).random(0)).toThrow(RangeError);
	});
});
