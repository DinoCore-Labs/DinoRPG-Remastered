import { describe, expect, it } from 'vitest';

import { mtDungeonGoldAward } from '../../../src/models/dungeon/dungeon.gold.js';

describe('MT IGold provisional conversion (not a recovered server formula)', () => {
	it('keeps the canonical 8-bit room value, without an invented multiplier', () => {
		expect(mtDungeonGoldAward(0)).toBe(0);
		expect(mtDungeonGoldAward(37)).toBe(37);
		expect(mtDungeonGoldAward(255)).toBe(255);
	});
	it('rejects out-of-range and non-integer values', () => {
		for (const value of [-1, 256, 5.2, Number.NaN, Number.POSITIVE_INFINITY]) {
			expect(() => mtDungeonGoldAward(value)).toThrow(RangeError);
		}
	});
});
