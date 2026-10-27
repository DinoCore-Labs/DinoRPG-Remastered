import { describe, expect, it } from 'vitest';

import {
	MT_DUNGEON_MASK_URL,
	mtDungeonMaskAlpha,
	mtDungeonMaskTint
} from '../../../src/components/dungeon/mtDungeonMask.js';

describe('Original Motion Twin screen vignette mask (SWF symbol 49)', () => {
	it('uses the recovered original image, not a generated rectangle or fog circles', () => {
		expect(MT_DUNGEON_MASK_URL).toBe('/dungeon/mt/mask_mt_49.png');
	});
	it('respects the original skin.mask percentage: desert=50%, cavern3=70%', () => {
		expect(mtDungeonMaskAlpha(50)).toBe(0.5);
		expect(mtDungeonMaskAlpha(70)).toBe(0.7);
		expect(mtDungeonMaskAlpha(0)).toBe(0);
		expect(mtDungeonMaskAlpha(100)).toBe(1);
	});
	it('cannot exceed the original 0..100 alpha range', () => {
		expect(mtDungeonMaskAlpha(-5)).toBe(0);
		expect(mtDungeonMaskAlpha(105)).toBe(1);
		expect(mtDungeonMaskAlpha(NaN)).toBe(0);
	});
	it('reproduces the MT 70% tint on the original black shapes', () => {
		expect(mtDungeonMaskTint(0)).toBe(0);
		expect(mtDungeonMaskTint(0xffffff)).toBe(0xb3b3b3);
		expect(mtDungeonMaskTint(0x3d3325)).toBe(0x2b241a);
	});
});
