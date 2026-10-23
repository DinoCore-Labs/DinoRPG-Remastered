import { describe, expect, it } from 'vitest';

import { placeMtDungeonItem } from '../../../src/components/dungeon/mtDungeonItemPlacement.js';
import { isOriginalMtPng, MT_ORIGINAL_PNG } from '../../../src/components/dungeon/mtOriginalSpriteCatalog.js';

describe('Recovered MT item_heal.png', () => {
	it('uses the recovered image while retaining the archived 201-file catalog', () => {
		expect(isOriginalMtPng('item_heal.png')).toBe(true);
		expect(MT_ORIGINAL_PNG).toHaveLength(201);
		const placement = placeMtDungeonItem('item_heal.png', 40, 80, 40, 29);
		expect(placement).toMatchObject({ x: 60, y: 100, anchorX: 0.5, anchorY: 0.5 });
	});
});
