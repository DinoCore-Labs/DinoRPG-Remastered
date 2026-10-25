import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import {
	MT_ORIGINAL_FOG_BLUR_PX,
	MT_ORIGINAL_FOG_MARGIN_PX,
	MT_ORIGINAL_FOG_TILE_PX,
	MT_ORIGINAL_FOG_URLS,
	mtOriginalFogFrame,
	mtOriginalFogIndex,
	mtOriginalFogSprites
} from '../../../src/components/dungeon/mtDungeonOriginalFog.js';

function scene(ix = 12, iy = 10, level = 1): MtDungeonScene {
	return {
		level,
		viewport: { ix, iy },
		mapWidth: 20,
		mapHeight: 18,
		roomIds: [], // the actual API redacts this field
		fog: [
			{ x: 12, y: 11 },
			{ x: 13, y: 11 },
			{ x: 11, y: 9 }
		]
	} as MtDungeonScene;
}

describe('SWF 404 Motion Twin fog for any dungeon map', () => {
	it('preserves native dimensions, 4 exact frames and 32px Flash blur metadata', () => {
		expect(MT_ORIGINAL_FOG_TILE_PX).toBe(40);
		expect(MT_ORIGINAL_FOG_MARGIN_PX).toBe(14);
		expect(MT_ORIGINAL_FOG_BLUR_PX).toBe(32);
		expect(MT_ORIGINAL_FOG_URLS).toHaveLength(4);
		expect(mtOriginalFogSprites(scene())[0]).toMatchObject({ x: -14, y: 26 });
	});
	it('uses exact X-major index, not a viewport or roomIds index', () => {
		expect(mtOriginalFogIndex(1, 20, 18, 12, 11)).toBe(587);
		expect(mtOriginalFogFrame(1, 20, 18, 12, 11)).toBe(587 % 4);
		expect(mtOriginalFogFrame(0, 20, 18, 0, 3)).toBe(3);
		expect(mtOriginalFogFrame(0, 17, 13, 2, 1)).toBe((2 * 13 + 1) % 4);
	});
	it('keeps the same frames after camera movements', () => {
		const before = mtOriginalFogSprites(scene());
		const after = mtOriginalFogSprites(scene(13, 11));
		expect(after.map(f => f.frame)).toEqual(before.map(f => f.frame));
		expect(after.map(f => [f.x, f.y])).toEqual(before.map(f => [f.x - 40, f.y - 40]));
	});
	it('fails closed on missing map dimensions rather than silently using 0', () => {
		const s = { ...scene(), mapHeight: 0 };
		expect(() => mtOriginalFogSprites(s)).toThrow('Invalid Motion Twin fog');
	});
	it('does not discover any cells on its own', () => {
		const s = scene();
		const old = structuredClone(s.fog);
		expect(mtOriginalFogSprites({ ...s, fog: [] })).toEqual([]);
		expect(mtOriginalFogSprites(s)).toHaveLength(3);
		expect(s.fog).toEqual(old);
	});
	it('handles negative overscan coordinates deterministically', () => {
		const f = mtOriginalFogFrame(0, 20, 18, -2, -1);
		expect(f).toBeGreaterThanOrEqual(0);
		expect(f).toBeLessThan(4);
	});
});
