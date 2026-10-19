import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import { createMtSpritePlan } from '../../../src/components/dungeon/mtOriginalSpriteCatalog.js';

function emptyScene(): MtDungeonScene {
	return {
		level: 0,
		fogColor: 0x27191c,
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
		overlays: [],
		fog: [],
		features: []
	};
}

describe('Original MT dungeon static item sprite selection', () => {
	it('uses only the three confirmed scenario icons from the canonical XML', () => {
		const scene = emptyScene();
		scene.features = [
			{ kind: 'scenario-icon', x: 1, y: 1, icon: 'chest' },
			{ kind: 'scenario-icon', x: 2, y: 1, icon: 'scroll' },
			{ kind: 'scenario-icon', x: 3, y: 1, icon: 'skel' }
		];
		const plan = createMtSpritePlan(scene);
		expect(plan.sprites.map(s => s.file)).toEqual(['item_chest.png', 'item_scroll.png', 'item_skel.png']);
		expect(plan.sprites.map(s => s.label)).toEqual([
			'item:scenario-icon:item_chest.png',
			'item:scenario-icon:item_scroll.png',
			'item:scenario-icon:item_skel.png'
		]);
		expect(plan.unresolved).toEqual([]);
	});

	it('uses known archived key, gold and both door-state sprites', () => {
		const scene = emptyScene();
		scene.features = [
			{ kind: 'key', x: 1, y: 1, keyId: 8 },
			{ kind: 'gold', x: 1, y: 2 },
			{ kind: 'door', x: 2, y: 2, orientation: 1, opened: false },
			{ kind: 'door', x: 3, y: 2, orientation: 2, opened: true }
		];
		const plan = createMtSpritePlan(scene);
		expect(plan.sprites.map(s => s.file)).toEqual([
			'item_key_01.png',
			'item_gold.png',
			'item_door_h_01.png',
			'item_door_v_open.png'
		]);
	});

	it('does not fabricate an absent original heal PNG or unsupported icon', () => {
		const scene = emptyScene();
		scene.features = [
			{ kind: 'heal', x: 2, y: 2, consumed: false },
			{ kind: 'scenario-icon', x: 3, y: 2, icon: 'missing_mystery' }
		];
		const plan = createMtSpritePlan(scene);
		expect(plan.sprites).toEqual([]);
		expect(plan.unresolved.some(e => e.includes('Objet de soin'))).toBe(true);
		expect(plan.unresolved.some(e => e.includes('missing_mystery'))).toBe(true);
	});
});
