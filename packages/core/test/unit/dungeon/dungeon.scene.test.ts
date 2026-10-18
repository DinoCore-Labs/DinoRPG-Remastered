import { describe, expect, it } from 'vitest';

import { decodeMtDungeon } from '../../../src/models/dungeon/dungeon.codec.js';
import {
	buildMtDungeonScene,
	getMtFlagIndex,
	getMtRoomIds,
	getMtViewport,
	isMtFogRevealed
} from '../../../src/models/dungeon/dungeon.scene.js';
import { getDungeonSkin } from '../../../src/models/dungeon/dungeon.skins.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

function smallMap(): DungeonStructure {
	const table = Array.from({ length: 5 }, () => Array<boolean>(5).fill(false));
	for (let x = 1; x <= 3; x++) for (let y = 1; y <= 3; y++) table[x]![y] = true;
	return {
		width: 5,
		height: 5,
		levels: [
			{
				table,
				rooms: [
					{
						id: 0,
						x: 1,
						y: 1,
						w: 3,
						h: 3,
						doors: [
							{ x: 2, y: 1, up: null, key: 1 },
							{ x: 1, y: 2, up: null, key: null }
						],
						item: { x: 3, y: 3, kind: 'IScenario', value: 0 }
					}
				]
			}
		],
		start: { x: 2, y: 2, l: 0 },
		exit: { x: 3, y: 2, l: 0 }
	};
}

const skin = getDungeonSkin('crypt2')!;
const opts = () => ({ map: smallMap(), level: 0, viewX: 0, viewY: 0, skin, noiseAt: () => 255 });

describe('Motion Twin View.hx scene transcription', () => {
	it('uses the exact historical 9x9 camera and 12x12 overscan', () => {
		expect(getMtViewport(10, 20)).toEqual({
			ix: 10,
			iy: 20,
			minX: 8,
			minY: 19,
			maxXExclusive: 20,
			maxYExclusive: 31,
			overscanPixels: 480,
			visiblePixels: 360
		});
	});
	it('does not mutate the source table when a scenario blocks a tile', () => {
		const input = opts();
		const scene = buildMtDungeonScene({ ...input, scenarioIcons: [{ kind: 'DIBlock' }] });
		expect(input.map.levels[0]!.table[3]![3]).toBe(true);
		expect(scene.floor.find(t => t.x === 3 && t.y === 3)).toBeUndefined();
		expect(scene.features.some(t => t.kind === 'scenario-icon')).toBe(false);
	});
	it('places all eight wall parts and the 48px corner offsets', () => {
		const scene = buildMtDungeonScene({ ...opts(), scenarioIcons: [{ kind: 'DINothing' }] });
		const atTopLeft = scene.walls.filter(w => w.x === 1 && w.y === 1).map(w => w.part);
		expect(atTopLeft).toEqual(['front', 'side-left', 'corner-top-left']);
		const atBottomRight = scene.walls.filter(w => w.x === 3 && w.y === 3);
		expect(atBottomRight.map(w => w.part)).toEqual(['side-right', 'back', 'corner-bottom-right']);
		expect(atBottomRight.find(w => w.part === 'corner-bottom-right')).toMatchObject({
			offsetX: 48,
			offsetY: 48,
			depth: 3
		});
	});
	it('keeps the exact MT entrance/exit stairs and tower frame inversion', () => {
		const normal = buildMtDungeonScene({ ...opts(), scenarioIcons: [{ kind: 'DINothing' }] });
		const tower = buildMtDungeonScene({ ...opts(), scenarioIcons: [{ kind: 'DINothing' }], tower: true });
		expect(normal.features.filter(f => f.kind === 'stair').map(f => f.frame)).toEqual([6, 5]);
		expect(tower.features.filter(f => f.kind === 'stair').map(f => f.frame)).toEqual([5, 6]);
	});
	it('uses X-major indexing for flags, rooms, and fog', () => {
		const m = smallMap();
		expect(getMtFlagIndex(m, 0, 2, 3)).toBe(13);
		expect(getMtRoomIds(m, 0)[2]![3]).toBe(0);
		const fog = new Uint8Array(5);
		fog[(13 + 7) >> 3] |= 1 << (13 & 7);
		expect(isMtFogRevealed(fog, m, 0, 2, 3)).toBe(true);
		expect(isMtFogRevealed(fog, m, 0, -1, 3)).toBe(false);
	});
	it('exactly reproduces getOverMap 8-neighbor masks and thresholds', () => {
		const scene = buildMtDungeonScene({
			...opts(),
			scenarioIcons: [{ kind: 'DINothing' }],
			noiseAt: (x, y) => (x === 1 && y === 2 ? 30 : 255)
		});
		const masks = scene.overlays.filter(o => o.x === 1 && o.y === 2).map(o => o.mask);
		expect(masks).toEqual([15, 15]);
		const second = buildMtDungeonScene({
			...opts(),
			scenarioIcons: [{ kind: 'DINothing' }],
			noiseAt: (x, y) => (x === 2 && y === 2 ? 255 : 100)
		});
		const m = second.overlays.filter(o => o.x === 2 && o.y === 2);
		// For PDense 100 -> id1, thus first overlay full (15), second none (0).
		expect(m.map(o => [o.layer, o.mask])).toEqual([[1, 15]]);
	});
	it('uses original flags for opened doors and preserves unresolved guardian seeds', () => {
		const map = smallMap();
		const scene = buildMtDungeonScene({
			...opts(),
			map,
			scenarioIcons: [{ kind: 'DINothing' }],
			flags: new Set([getMtFlagIndex(map, 0, 2, 1)])
		});
		expect(scene.features.find(f => f.kind === 'door')).toMatchObject({ kind: 'door', x: 2, y: 1, opened: true });
		expect(scene.features.find(f => f.kind === 'guardian' && f.source === 'door')).toMatchObject({
			x: 1,
			y: 2,
			randomSeed: 7
		});
	});
	it('retains the exact per-tile mt.Rand draw ordering, without guessing frame numbers', () => {
		const scene = buildMtDungeonScene({ ...opts(), scenarioIcons: [{ kind: 'DINothing' }] });
		const floor = scene.floor.find(f => f.x === 1 && f.y === 1)!;
		expect(floor).toMatchObject({ frameSeed: 6, randomDrawIndex: 0 });
		expect(scene.walls.filter(w => w.x === 1 && w.y === 1).map(w => w.randomDrawIndex)).toEqual([1, 2, 3]);
	});
	it('builds terrain on an unmodified, authentic MT encoded dungeon', () => {
		// Source: DinoRPG/xml/fr/dungeons/stepp_3.xml, Git blob 56a4793d...
		const stepp3 =
			'[[30x30x1 14R 10M 2S 2K]]hH4bj1PUyrsOsuur5LvNyTGGRm5OOjguttay5qYuIIHq1v3jUqWuJuDg4n30NqmJGoLhrHjktiQuzzlrdG1OCWc12zO0ndq0AqdYNvvsDBbCZcqKP2rrjbLqahdJqPoyffiyOAHWQziBQK3ya2kpqIKIKuuqu4ackYybBnJNKuYQQOhjGaRaaSWHd';
		const map = decodeMtDungeon(stepp3).structure;
		const scene = buildMtDungeonScene({
			map,
			level: 0,
			viewX: map.start.x - 4,
			viewY: map.start.y - 4,
			skin,
			noiseAt: () => 255,
			scenarioIcons: Array.from({ length: 256 }, () => ({ kind: 'DINothing' as const }))
		});
		expect(scene.floor).toHaveLength(38);
		expect(scene.walls).toHaveLength(62);
		expect(scene.features.filter(f => f.kind === 'stair')).toHaveLength(1);
	});
	it('reports unavailable original scenario icons instead of fabricating them', () => {
		expect(() => buildMtDungeonScene(opts())).toThrow('Missing original _sicons entry');
	});
});
