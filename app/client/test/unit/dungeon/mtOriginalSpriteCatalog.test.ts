import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import {
	createMtSpritePlan,
	isOriginalMtPng,
	MT_BUNDLED_PNG,
	MT_ORIGINAL_PNG
} from '../../../src/components/dungeon/mtOriginalSpriteCatalog.js';

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
	floor: [{ x: 6, y: 7, ground: 'hell', frameSeed: 0, randomDrawIndex: 0, noiseId: 0 }],
	overlays: [],
	walls: [
		{ x: 6, y: 7, part: 'front', symbol: 'ruin', frameSeed: 0, randomDrawIndex: 1, offsetX: 0, offsetY: 0, depth: 0 },
		{
			x: 6,
			y: 7,
			part: 'side-left',
			symbol: 'ruin',
			frameSeed: 0,
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

describe('MT original archive sprite catalog (201 PNG)', () => {
	it('contains exactly the original 201 unique exports without substituting textures', () => {
		expect(MT_ORIGINAL_PNG).toHaveLength(201);
		expect(new Set(MT_ORIGINAL_PNG).size).toBe(201);
		expect(MT_BUNDLED_PNG).toHaveLength(45);
		for (const name of [
			'front_egypt_06.png',
			'ground_sewer_07.png',
			'corner_forest_01.png',
			'overground_grass_15.png',
			'overground_stone_00.png'
		]) {
			expect(isOriginalMtPng(name)).toBe(true);
		}
		expect(isOriginalMtPng('front_labo_01.png')).toBe(false);
	});

	it('uses genuine mt.Rand calls in historical draw order rather than frame 1', () => {
		const plan = createMtSpritePlan(scene());
		expect(plan.sprites.map(sprite => sprite.file)).toEqual([
			'ground_hell_02.png',
			'front_ruin_02.png',
			'item_key_01.png',
			'item_gold.png',
			'side_ruin_01.png'
		]);
		expect(plan.sprites.map(sprite => sprite.layer)).toEqual([0, 0, 1, 1, 3]);
		expect(plan.unresolved).not.toContain(
			'Sélection des variantes mt.Rand non portée : aperçu avec la première image seulement'
		);
	});

	it('resolves all available ground and wall families using archive files', () => {
		const s = scene();
		s.floor = ['cavern', 'crypt', 'desert', 'grass', 'hell', 'sewer'].map((ground, i) => ({
			x: i,
			y: 4,
			ground,
			frameSeed: i + 1,
			randomDrawIndex: 0,
			noiseId: 0
		}));
		s.walls = ['cavern', 'crypt', 'egypt', 'forest', 'hell', 'ruin', 'sewer'].map((symbol, i) => ({
			x: i,
			y: 4,
			part: 'front' as const,
			symbol,
			frameSeed: i + 1,
			randomDrawIndex: 1,
			offsetX: 0,
			offsetY: 0,
			depth: 0 as const
		}));
		// Seven wall tiles need seven matching ground tiles so each tile seed gets a ground draw.
		s.floor.push({ x: 6, y: 4, ground: 'hell', frameSeed: 7, randomDrawIndex: 0, noiseId: 0 });
		const plan = createMtSpritePlan(s);
		expect(plan.sprites.filter(sp => sp.label.startsWith('ground:'))).toHaveLength(7);
		expect(plan.sprites.filter(sp => sp.label.startsWith('wall:'))).toHaveLength(7);
		expect(plan.sprites.find(sp => sp.label === 'ground:desert')?.file.startsWith('ground_sand_')).toBe(true);
		expect(plan.sprites.some(sp => sp.file.startsWith('front_egypt_'))).toBe(true);
		expect(plan.unresolved).toEqual([]);
	});

	it('respects opening state and orientation for original door PNGs', () => {
		const s = scene();
		s.features = [
			{ kind: 'door', x: 2, y: 2, opened: false, orientation: 1 },
			{ kind: 'door', x: 3, y: 2, opened: true, orientation: 2 },
			{ kind: 'stair', x: 4, y: 2, up: true, frame: 5, orientation: 1 },
			{ kind: 'stair', x: 5, y: 2, up: false, frame: 6, orientation: 2 }
		];
		expect(
			createMtSpritePlan(s)
				.sprites.filter(sp => sp.label.startsWith('item:'))
				.map(sp => sp.file)
		).toEqual(['item_door_h_01.png', 'item_door_v_open.png', 'item_stair_up.png', 'item_stair_down.png']);
	});

	it('keeps unsafe overlay-to-Flash mappings off without explicit consent', () => {
		const s = scene();
		s.overlays = [
			{ x: 6, y: 7, layer: 1, mask: 15, symbol: 'grass' },
			{ x: 7, y: 7, layer: 2, mask: 4, symbol: 'ruinPurple' }
		];
		const strict = createMtSpritePlan(s);
		expect(strict.sprites.some(sp => sp.file.startsWith('overground_'))).toBe(false);
		expect(strict.unresolved.some(msg => msg.includes('ruinPurple'))).toBe(true);
		const optIn = createMtSpritePlan(s, { showUnverifiedSameNameOverlays: true });
		expect(optIn.sprites.some(sp => sp.file === 'overground_grass_15.png')).toBe(true);
		expect(optIn.sprites.some(sp => sp.file.includes('ruinPurple'))).toBe(false);
	});

	it('does not fabricate absent labo / mine artwork or external monsters', () => {
		const s = scene();
		s.floor[0]!.ground = 'labo';
		s.walls[0]!.symbol = 'mine';
		s.features.push({ kind: 'guardian', source: 'door', x: 6, y: 7, randomSeed: 0 });
		s.fog.push({ x: 6, y: 7, color: 0x27191c, blur: 32 });
		const plan = createMtSpritePlan(s);
		expect(plan.sprites.some(sp => sp.file.includes('labo') || sp.file.includes('mine'))).toBe(false);
		expect(plan.unresolved.some(msg => msg.includes('labo'))).toBe(true);
		expect(plan.unresolved.some(msg => msg.includes('gardien'))).toBe(false); // French capitalized label
		expect(plan.unresolved.some(msg => msg.includes('Gardien'))).toBe(true);
		expect(plan.originalFogSupported).toBe(false);
	});

	it('allows tested frame selection overrides and validates them', () => {
		const plan = createMtSpritePlan(scene(), { frameFor: (_tile, count) => count, assetBase: '/static/mt/' });
		expect(plan.sprites[0]!.file).toBe('ground_hell_05.png');
		expect(plan.sprites[0]!.url).toBe('/static/mt/ground_hell_05.png');
		expect(() => createMtSpritePlan(scene(), { frameFor: () => 99 })).toThrow('Frame MT invalide');
	});
});
