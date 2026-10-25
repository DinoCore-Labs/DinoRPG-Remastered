import { describe, expect, it } from 'vitest';

import { buildMtDungeonScene } from '../../../src/models/dungeon/dungeon.scene.js';
import { getDungeonSkin } from '../../../src/models/dungeon/dungeon.skins.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';
import { redactMtDungeonViewport } from '../../../src/models/dungeon/dungeon.viewport.js';

const map: DungeonStructure = {
	width: 5,
	height: 6,
	levels: [
		{
			table: Array.from({ length: 5 }, () => Array<boolean>(6).fill(true)),
			rooms: [{ id: 0, x: 1, y: 1, w: 3, h: 4, doors: [], item: null }]
		}
	],
	start: { x: 2, y: 2, l: 0 },
	exit: { x: 3, y: 3, l: 0 }
};

describe('MT scene fog metadata across all skins', () => {
	it.each(['desert', 'cavern3', 'crypt', 'forest', 'labo'])(
		'carries skin %s settings without revealing hidden rooms',
		key => {
			const skin = getDungeonSkin(key)!;
			const full = buildMtDungeonScene({
				map,
				level: 0,
				viewX: 0,
				viewY: 0,
				skin,
				noiseAt: () => 255,
				fog: new Uint8Array((map.width * map.height + 7) >> 3),
				scenarioIcons: []
			});
			expect(full).toMatchObject({
				mapWidth: 5,
				mapHeight: 6,
				skinKey: key,
				fogColor: skin.fog,
				fogMask: skin.mask
			});
			const redacted = redactMtDungeonViewport(full, map, Array.from(new Uint8Array((30 + 7) >> 3)));
			expect(redacted.roomIds).toEqual([]);
			expect(redacted.mapWidth).toBe(5);
			expect(redacted.mapHeight).toBe(6);
			expect(redacted.skinKey).toBe(key);
			expect(redacted.floor).toEqual([]);
		}
	);
});
