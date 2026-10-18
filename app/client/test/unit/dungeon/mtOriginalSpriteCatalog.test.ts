import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import { createMtSpritePlan, MT_BUNDLED_PNG } from '../../../src/components/dungeon/mtOriginalSpriteCatalog.js';

const scene = (): MtDungeonScene => ({
	level: 0,
	fogColor: 0x27191c,
	viewport: {
		ix: 5,
		iy: 5,
		minX: 3,
		minY: 4,
		maxXExclusive: 15,
		maxYExclusive: 16,
		overscanPixels: 480,
		visiblePixels: 360
	},
	roomIds: [],
	floor: [{ x: 6, y: 7, ground: 'hell', frameSeed: 23, randomDrawIndex: 0, noiseId: 0 }],
	overlays: [],
	walls: [
		{ x: 6, y: 7, part: 'front', symbol: 'ruin', frameSeed: 23, randomDrawIndex: 1, offsetX: 0, offsetY: 0, depth: 0 },
		{
			x: 6,
			y: 7,
			part: 'side-left',
			symbol: 'ruin',
			frameSeed: 23,
			randomDrawIndex: 2,
			offsetX: 0,
			offsetY: 0,
			depth: 3
		}
	],
	features: [
		{ kind: 'key', x: 6, y: 7, keyId: 8 },
		{ kind: 'gold', x: 7, y: 7 }
	],
	fog: []
});

describe('MT original PNG catalog', () => {
	it('contains the exact previously supplied original asset subset', () => {
		expect(MT_BUNDLED_PNG).toHaveLength(45);
		expect(new Set(MT_BUNDLED_PNG).size).toBe(45);
		expect(MT_BUNDLED_PNG).toContain('front_ruin_06.png');
	});

	it('uses original PNG filenames and preserves historical depth grouping', () => {
		const plan = createMtSpritePlan(scene());
		expect(plan.sprites.map(sprite => sprite.file)).toEqual([
			'ground_hell_01.png',
			'front_ruin_01.png',
			'item_key_01.png',
			'item_gold.png',
			'side_ruin_01.png'
		]);
		expect(plan.sprites.map(sprite => sprite.layer)).toEqual([0, 0, 1, 1, 3]);
		expect(plan.sprites[0]).toMatchObject({ x: 240, y: 280, url: '/dungeon/mt/ground_hell_01.png' });
		expect(plan.previewOnly).toBe(true);
	});

	it('accepts only explicit, validated variation selection', () => {
		const plan = createMtSpritePlan(scene(), {
			frameFor: (_tile, available) => (available > 1 ? 2 : 1),
			assetBase: '/static/mt/'
		});
		expect(plan.sprites.map(s => s.file)).toContain('ground_hell_02.png');
		expect(plan.sprites.map(s => s.file)).toContain('front_ruin_02.png');
		expect(plan.sprites[0].url).toBe('/static/mt/ground_hell_02.png');
		expect(plan.unresolved).not.toContain(
			'Sélection des variantes mt.Rand non portée : aperçu avec la première image seulement'
		);
	});

	it('rejects unverified PRNG frame indices instead of silently replacing them', () => {
		expect(() => createMtSpritePlan(scene(), { frameFor: () => 99 })).toThrow('Frame MT invalide');
	});

	it('never replaces missing original art with invented geometry or textures', () => {
		const s = scene();
		s.floor[0]!.ground = 'labo';
		s.walls[0]!.symbol = 'labo';
		s.overlays.push({ x: 6, y: 7, layer: 1, mask: 15, symbol: 'ruinPurple' });
		s.fog.push({ x: 6, y: 7, color: 0x27191c, blur: 32 });
		const plan = createMtSpritePlan(s);
		expect(plan.sprites.some(cmd => cmd.label === 'ground:labo')).toBe(false);
		expect(plan.sprites.some(cmd => cmd.file.includes('labo'))).toBe(false);
		expect(plan.unresolved.some(message => message.includes('ruinPurple'))).toBe(true);
		expect(plan.unresolved.some(message => message.includes('Brouillard Flash'))).toBe(true);
		expect(plan.originalFogSupported).toBe(false);
	});

	it('retains the source stage-2 wall offsets rather than recomputing them', () => {
		const s = scene();
		s.walls[0]!.part = 'corner-top-right';
		s.walls[0]!.offsetX = 48;
		const plan = createMtSpritePlan(s);
		expect(plan.sprites.find(v => v.label === 'wall:corner-top-right')).toMatchObject({
			file: 'corner_ruin_01.png',
			x: 288,
			y: 280
		});
	});
});
