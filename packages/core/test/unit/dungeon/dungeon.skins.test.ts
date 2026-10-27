import { describe, expect, it } from 'vitest';

import {
	DUNGEON_DEFAULT_SKIN,
	DUNGEON_GROUND_FRAMES,
	DUNGEON_SKINS,
	DUNGEON_TILE_SIZE,
	DUNGEON_VIEW_COLUMNS,
	DUNGEON_VIEW_ROWS,
	DUNGEON_WALL_FRAMES,
	getDungeonSkin
} from '../../../src/models/dungeon/dungeon.skins.js';
import { DUNGEON_ITEM_KIND } from '../../../src/models/dungeon/dungeon.types.js';

describe('Motion Twin original dungeon constants', () => {
	it('keeps exact pixel dimensions and timeline-frame counts from View.hx', () => {
		expect(DUNGEON_TILE_SIZE).toBe(40);
		expect(DUNGEON_VIEW_COLUMNS).toBe(9);
		expect(DUNGEON_VIEW_ROWS).toBe(9);
		expect(DUNGEON_GROUND_FRAMES).toBe(30);
		expect(DUNGEON_WALL_FRAMES).toBe(10);
		expect(DUNGEON_DEFAULT_SKIN).toBe('labo');
	});

	it('preserves the original 32 explicitly named skin configurations', () => {
		expect(DUNGEON_SKINS).toHaveLength(32);
		expect(new Set(DUNGEON_SKINS.map(skin => skin.key)).size).toBe(32);
		expect(getDungeonSkin('sewer2')).toEqual({
			key: 'sewer2',
			wall: 'sewer',
			ground: 'sewer',
			mask: 100,
			fog: 0x37321e,
			perlin: 'PFew',
			over: [null, 'creep']
		});
		expect(getDungeonSkin('ruin4')?.fog).toBe(0x27191c);
		expect(getDungeonSkin('labo')?.over).toEqual([null, 'grassLabo']);
		expect(getDungeonSkin('nonexistent')).toBeNull();
	});

	it('keeps DungeonCodec.hx binary item ordinal values', () => {
		expect(DUNGEON_ITEM_KIND).toEqual({ IKey: 0, IGold: 1, IHeal: 2, IScenario: 3 });
	});
});
