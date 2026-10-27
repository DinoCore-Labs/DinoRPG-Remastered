import { describe, expect, it } from 'vitest';

import { placeMtDungeonItem } from '../../../src/components/dungeon/mtDungeonItemPlacement.js';

describe('MT dungeon item placement based on MazeRenderer', () => {
	const at = (file: string, width = 40, height = 40) => placeMtDungeonItem(file, 6 * 40, 7 * 40, width, height);

	it('centers the original gold, key, and chest on their own map cell', () => {
		for (const [file, factor] of [
			['item_gold.png', 1],
			['item_chest.png', 1],
			['item_key_01.png', 0.7],
			['item_scroll.png', 0.7],
			['item_skel.png', 0.8]
		] as const) {
			expect(at(file)).toEqual({ x: 260, y: 300, anchorX: 0.5, anchorY: 0.5, scale: factor });
		}
	});

	it('positions open and closed door PNGs identically for each orientation', () => {
		for (const file of ['item_door_h_01.png', 'item_door_h_open.png', 'item_door_v_01.png', 'item_door_v_open.png']) {
			expect(at(file, 40, 54)).toMatchObject({ x: 260, y: 300, scale: 52 / 54 });
		}
	});

	it('preserves separate stair sizes and the -0.4 cell offset without moving ground', () => {
		expect(at('item_stair_up.png')).toMatchObject({ x: 260, y: 284, scale: 1.2 });
		expect(at('item_stair_down.png')).toMatchObject({ x: 260, y: 284, scale: 0.9 });
		expect(at('ground_sand_01.png')).toBeNull();
		expect(at('item_heal.png')).toMatchObject({ scale: 0.9 }); // recovered in step 20K
	});

	it('fails closed for invalid dimensions', () => {
		expect(at('item_gold.png', 0, 40)).toBeNull();
		expect(at('item_gold.png', 40, NaN)).toBeNull();
	});
});
