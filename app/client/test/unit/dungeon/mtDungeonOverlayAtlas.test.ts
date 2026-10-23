import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import {
	MT_DUNGEON_OVERLAY_FAMILIES,
	resolveMtDungeonOverlayArt
} from '../../../src/components/dungeon/mtDungeonOverlayAtlas.js';
import { createMtSpritePlan, MT_ORIGINAL_PNG } from '../../../src/components/dungeon/mtOriginalSpriteCatalog.js';

function scene(): MtDungeonScene {
	return {
		level: 0,
		fogColor: 0x3d3325,
		viewport: {
			ix: 0,
			iy: 0,
			minX: -2,
			minY: -1,
			maxXExclusive: 10,
			maxYExclusive: 11,
			overscanPixels: 480,
			visiblePixels: 360
		},
		roomIds: [],
		floor: [],
		walls: [],
		features: [],
		fog: [],
		overlays: [
			{ x: 2, y: 3, layer: 1, symbol: 'ruinPurple', mask: 15 },
			{ x: 2, y: 3, layer: 2, symbol: 'dirt', mask: 4 },
			{ x: 5, y: 3, layer: 1, symbol: 'square', mask: 12 }
		]
	};
}

describe('20L: MT overlay color families, with explicit provenance boundaries', () => {
	it('maps the absent dirt, purple and square Flash labels to existing texture families', () => {
		expect(resolveMtDungeonOverlayArt('dirt', 15)).toMatchObject({ file: 'overground_stone_15.png' });
		expect(resolveMtDungeonOverlayArt('ruinPurple', 4)).toMatchObject({ file: 'overground_broken_04.png' });
		expect(resolveMtDungeonOverlayArt('square', 12)).toMatchObject({ file: 'overground_slab_12.png' });
	});
	it('does not invent nonexistent texture files or out-of-range Flash frames', () => {
		for (const symbol of Object.keys(MT_DUNGEON_OVERLAY_FAMILIES)) {
			for (let mask = 1; mask <= 15; mask++) {
				const resolved = resolveMtDungeonOverlayArt(symbol, mask)!;
				expect(MT_ORIGINAL_PNG).toContain(resolved.file);
				expect(resolved.verifiedOriginalMapping).toBe(false);
			}
		}
		expect(resolveMtDungeonOverlayArt('unrecovered', 15)).toBeNull();
		expect(resolveMtDungeonOverlayArt('dirt', 0)).toBeNull();
		expect(resolveMtDungeonOverlayArt('dirt', 16)).toBeNull();
	});
	it('never enables speculative overlays by default and preserves both original overlay layers', () => {
		const strict = createMtSpritePlan(scene());
		expect(strict.sprites).toEqual([]);
		const preview = createMtSpritePlan(scene(), { showUnverifiedSameNameOverlays: true });
		expect(preview.sprites.map(item => item.file)).toEqual([
			'overground_broken_15.png',
			'overground_stone_04.png',
			'overground_slab_12.png'
		]);
		expect(preview.sprites.every(item => item.layer === 0)).toBe(true);
		expect(preview.unresolved.some(message => message.includes('non vérifiée'))).toBe(true);
	});
});
