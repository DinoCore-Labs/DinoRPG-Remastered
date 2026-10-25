import { describe, expect, it } from 'vitest';

import {
	composeMtTerrainBitmap,
	isMtTerrainDraw,
	MT_TERRAIN_EFFECT_PADDING,
	MT_TERRAIN_FILTER_ORDER,
	MT_TERRAIN_FILTERS
} from '../../../src/components/dungeon/mtDungeonTerrainEffects.js';

describe('MT View.hx terrain filter pipeline', () => {
	it('retains the exact Flash filter arguments, separately from the rendering emulation', () => {
		expect(MT_TERRAIN_FILTERS.overgroundGlow).toMatchObject({ color: 0, alpha: 0.7, blurX: 2, blurY: 2 });
		expect(MT_TERRAIN_FILTERS.innerDropShadow).toMatchObject({
			alpha: 0.3,
			distance: 15,
			angle: 0,
			blurX: 3,
			inner: true
		});
		expect(MT_TERRAIN_FILTERS.innerBlackGlow).toMatchObject({ alpha: 0.35, blurX: 64, inner: true });
		expect(MT_TERRAIN_FILTERS.outerPurpleGlow).toMatchObject({
			color: 0x72525b,
			alpha: 0.6,
			blurX: 64,
			inner: false
		});
	});
	it('never processes walls, actors, doors, fog or the fixed MT mask in the terrain pass', () => {
		expect(['ground:desert', 'overground:ruin:1'].map(isMtTerrainDraw)).toEqual([true, true]);
		for (const label of ['wall:front', 'item:gold', 'guardian', 'fog:404', 'mask:49'])
			expect(isMtTerrainDraw(label)).toBe(false);
	});
	it('keeps the original filter ordering and adequate outer blur overscan', () => {
		expect(MT_TERRAIN_FILTER_ORDER).toEqual([
			'overground-black-glow',
			'ground-inner-drop-shadow',
			'ground-inner-black-glow',
			'ground-outer-purple-glow'
		]);
		expect(MT_TERRAIN_EFFECT_PADDING).toBeGreaterThanOrEqual(64);
	});
	it('does not attempt browser rasterization when there is no terrain', () => {
		expect(composeMtTerrainBitmap([], { minX: 0, minY: 0, ix: 0, iy: 0, overscanPixels: 480 })).toBeNull();
	});
});
