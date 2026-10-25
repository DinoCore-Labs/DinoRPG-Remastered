import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import {
	MT_ORIGINAL_FOG_BLUR_PX,
	MT_ORIGINAL_FOG_MARGIN_PX,
	MT_ORIGINAL_FOG_TILE_PX,
	MT_ORIGINAL_FOG_URLS,
	mtOriginalFogFrame,
	mtOriginalFogSprites
} from '../../../src/components/dungeon/mtDungeonOriginalFog.js';

function scene(viewX = 12, viewY = 10, level = 1): MtDungeonScene {
	return {
		level,
		viewport: { ix: viewX, iy: viewY },
		roomIds: Array.from({ length: 20 }, () => Array<number | null>(18).fill(null)),
		fog: [
			{ x: 12, y: 11 },
			{ x: 13, y: 11 },
			{ x: 11, y: 9 }
		]
	} as MtDungeonScene;
}

describe('Original Motion Twin fog frames (gfx.swf fog / 404)', () => {
	it('uses all four extracted PNG frames at 40px with the actual -14px registration', () => {
		expect(MT_ORIGINAL_FOG_TILE_PX).toBe(40);
		expect(MT_ORIGINAL_FOG_MARGIN_PX).toBe(14);
		expect(MT_ORIGINAL_FOG_BLUR_PX).toBe(32);
		expect(MT_ORIGINAL_FOG_URLS).toHaveLength(4);
		expect(mtOriginalFogSprites(scene())[0]).toMatchObject({ x: -14, y: 26 });
	});
	it('uses the original X-major position for deterministic frame choices', () => {
		const f = mtOriginalFogFrame(1, 20, 18, 12, 11);
		expect(f).toBe((360 + 12 * 18 + 11) % 4);
		for (let v = 0; v < 4; v++) expect(mtOriginalFogFrame(0, 20, 18, 0, v)).toBe(v);
	});
	it('keeps world-frame choice stable while the camera pans', () => {
		const before = mtOriginalFogSprites(scene());
		const after = mtOriginalFogSprites(scene(13, 11));
		expect(after.map(f => f.frame)).toEqual(before.map(f => f.frame));
		expect(after.map(f => [f.x, f.y])).toEqual(before.map(f => [f.x - 40, f.y - 40]));
	});
	it('does not mutate the server visibility data or reveal new tiles', () => {
		const input = scene();
		const original = structuredClone(input.fog);
		expect(mtOriginalFogSprites({ ...input, fog: [] })).toEqual([]);
		expect(mtOriginalFogSprites(input)).toHaveLength(3);
		expect(input.fog).toEqual(original);
	});
	it('preserves a valid frame for negative overscan coordinates', () => {
		expect(mtOriginalFogFrame(0, 20, 18, -2, -1)).toBeGreaterThanOrEqual(0);
		expect(mtOriginalFogFrame(0, 20, 18, -2, -1)).toBeLessThan(4);
	});
});
