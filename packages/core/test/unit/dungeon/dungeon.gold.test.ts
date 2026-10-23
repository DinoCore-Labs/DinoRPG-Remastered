import { describe, expect, it } from 'vitest';

import { mtDungeonGoldAward } from '../../../src/models/dungeon/dungeon.gold.js';

describe('MT shared gold reserve (explicit Remastered policy)', () => {
	it('starts from XML gold and decreases payout as the global reserve is depleted', () => {
		expect(mtDungeonGoldAward(17, 150_000, 150_000)).toBe(2550);
		expect(mtDungeonGoldAward(17, 147_450, 150_000)).toBe(2507);
		expect(mtDungeonGoldAward(17, 10_000, 150_000)).toBe(170);
	});
	it('never distributes more than the remaining global reserve', () => {
		expect(mtDungeonGoldAward(255, 1, 150_000)).toBe(1);
		expect(mtDungeonGoldAward(255, 0, 150_000)).toBe(0);
		expect(mtDungeonGoldAward(0, 150_000, 150_000)).toBe(0);
		expect(mtDungeonGoldAward(255, 0, 0)).toBe(0);
	});
	it('rejects forged or inconsistent map and reserve values', () => {
		for (const n of [-1, 256, 5.2, NaN, Infinity]) {
			expect(() => mtDungeonGoldAward(n, 100, 100)).toThrow(RangeError);
		}
		for (const [remaining, initial] of [
			[-1, 100],
			[101, 100],
			[1.4, 100],
			[0, -1],
			[0, 2147483648]
		]) {
			expect(() => mtDungeonGoldAward(1, remaining, initial)).toThrow(RangeError);
		}
	});
});
