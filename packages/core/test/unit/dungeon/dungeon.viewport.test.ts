import { describe, expect, it } from 'vitest';

import { createMtDungeonFog, revealMtDungeonFog } from '../../../src/models/dungeon/dungeon.exploration.js';
import { buildMtDungeonScene } from '../../../src/models/dungeon/dungeon.scene.js';
import { getDungeonSkin } from '../../../src/models/dungeon/dungeon.skins.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';
import { redactMtDungeonViewport } from '../../../src/models/dungeon/dungeon.viewport.js';

function originalShape(): DungeonStructure {
	const table = Array.from({ length: 11 }, () => Array<boolean>(11).fill(true));
	return {
		width: 11,
		height: 11,
		levels: [
			{
				table,
				rooms: [
					{
						id: 0,
						x: 0,
						y: 0,
						w: 11,
						h: 11,
						doors: [],
						item: { x: 6, y: 5, kind: 'IKey', value: 0 }
					}
				]
			}
		],
		start: { x: 5, y: 5, l: 0 },
		exit: { x: 10, y: 10, l: 0 }
	};
}

function sceneAndFog() {
	const map = originalShape();
	const fog = revealMtDungeonFog(map, createMtDungeonFog(map), map.start);
	const scene = buildMtDungeonScene({
		map,
		level: 0,
		viewX: 1,
		viewY: 1,
		skin: getDungeonSkin('desert')!,
		noiseAt: () => 255,
		fog,
		scenarioIcons: []
	});
	return { scene, map, fog: [...fog] };
}

describe('authenticated MT viewport redaction', () => {
	it('never sends full-map room ownership', () => {
		const { scene, map, fog } = sceneAndFog();
		expect(scene.roomIds.length).toBe(map.width);
		expect(redactMtDungeonViewport(scene, map, fog).roomIds).toEqual([]);
	});
	it('omits undiscovered floor, walls, overlays and pickups', () => {
		const { scene, map, fog } = sceneAndFog();
		const visible = redactMtDungeonViewport(scene, map, fog);
		expect(visible.floor.some(tile => tile.x === 5 && tile.y === 5)).toBe(true);
		expect(visible.floor.some(tile => tile.x === 10 && tile.y === 10)).toBe(false);
		expect(visible.features.some(f => f.kind === 'key' && f.x === 6 && f.y === 5)).toBe(true);
		expect(visible.walls.every(tile => tile.x >= 4 && tile.x <= 6 && tile.y >= 4 && tile.y <= 6)).toBe(true);
		expect(visible.overlays.every(tile => tile.x >= 4 && tile.x <= 6 && tile.y >= 4 && tile.y <= 6)).toBe(true);
	});
	it('does not mutate source scene or source fog', () => {
		const { scene, map, fog } = sceneAndFog();
		const previous = JSON.stringify(scene);
		const bytes = JSON.stringify(fog);
		redactMtDungeonViewport(scene, map, fog);
		expect(JSON.stringify(scene)).toBe(previous);
		expect(JSON.stringify(fog)).toBe(bytes);
	});
	it('supports disabled fog without exposing roomIds', () => {
		const { scene, map } = sceneAndFog();
		const visible = redactMtDungeonViewport(scene, map, null);
		expect(visible.floor).toHaveLength(scene.floor.length);
		expect(visible.roomIds).toEqual([]);
	});
});
