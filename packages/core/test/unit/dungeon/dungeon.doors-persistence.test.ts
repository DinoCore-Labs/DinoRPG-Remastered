import { describe, expect, it } from 'vitest';

import { restoreMtDungeonProgress, snapshotMtDungeonProgress } from '../../../src/models/dungeon/dungeon.progress.js';
import { buildMtDungeonScene, getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration
} from '../../../src/models/dungeon/dungeon.session.js';
import { getDungeonSkin } from '../../../src/models/dungeon/dungeon.skins.js';

// One key (ID 2), one door using the same ID, and another door without a key
// (guardian). Only the key-linked door must be opened by the key.
const map: MtSessionConfiguration['map'] = {
	width: 5,
	height: 5,
	levels: [
		{
			table: Array.from({ length: 5 }, (_, x) => Array.from({ length: 5 }, (_, y) => x > 0 && y > 0 && x < 4 && y < 4)),
			rooms: [
				{
					id: 0,
					x: 1,
					y: 1,
					w: 3,
					h: 3,
					doors: [
						{ x: 3, y: 1, up: null, key: 2 },
						{ x: 3, y: 2, up: null, key: null }
					],
					item: { x: 2, y: 1, kind: 'IKey', value: 2 }
				}
			]
		}
	],
	start: { x: 1, y: 1, l: 0 },
	exit: { x: 3, y: 3, l: 0 }
};
const cfg: MtSessionConfiguration = { map, mapId: 'stepp_0' };
const command = (x: number, y: number, dx: number, dy: number) => ({ x, y, l: 0, dx, dy, dl: 0 });
function accepted(state: MtDungeonSession, x: number, y: number, dx: number, dy: number) {
	const result = applyMtDungeonCommandBatch(cfg, state, [command(x, y, dx, dy)]);
	if (!result.ok) throw new Error(result.reason);
	return result;
}

describe('MT key doors: authority, flags, and restored discoveries (step 20F)', () => {
	it('rejects crossing without the correct key, without changing position, keys or flags', () => {
		const empty = createMtDungeonSession(cfg);
		const state = { ...empty, position: { x: 2, y: 1, l: 0 } };
		const response = accepted(state, 2, 1, 1, 0);
		expect(response.blockedDoor).toBe('missing-key');
		expect(response.requiredKey).toBe(2);
		expect(response.session.position).toEqual(state.position);
		expect(response.session.keys).toEqual([]);
		expect(response.session.flags).toEqual([]);
		expect(response.session.revision).toBe(state.revision + 1);
		// A key with the wrong index must never open this door.
		const wrongKey = accepted({ ...state, keys: [true] }, 2, 1, 1, 0);
		expect(wrongKey.blockedDoor).toBe('missing-key');
		expect(wrongKey.requiredKey).toBe(2);
		expect(wrongKey.session.position).toEqual(state.position);
	});

	it('collects the map key once, opens the matching door and does not touch guardian flags', () => {
		const initial = createMtDungeonSession(cfg);
		const key = accepted(initial, 1, 1, 1, 0);
		expect(key.blockedDoor).toBeUndefined();
		expect(key.requiredKey).toBeUndefined();
		expect(key.session.keys[2]).toBe(true);
		expect(key.session.flags).toContain(getMtFlagIndex(map, 0, 2, 1));
		const door = accepted(key.session, 2, 1, 1, 0);
		expect(door.blockedDoor).toBeUndefined();
		expect(door.session.position).toEqual({ x: 3, y: 1, l: 0 });
		expect(door.session.flags).toContain(getMtFlagIndex(map, 0, 3, 1));
		expect(door.session.flags).not.toContain(getMtFlagIndex(map, 0, 3, 2));
	});

	it('keeps key, open door and discovered fog after deleting the live visit', () => {
		const initial = createMtDungeonSession(cfg);
		const key = accepted(initial, 1, 1, 1, 0);
		const opened = accepted(key.session, 2, 1, 1, 0).session;
		const saved = snapshotMtDungeonProgress(opened);
		const newRun = restoreMtDungeonProgress(createMtDungeonSession(cfg), saved, id => {
			if (id !== cfg.mapId) throw new Error('wrong map');
			return cfg;
		});
		expect(newRun.position).toEqual(map.start);
		expect(newRun.keys[2]).toBe(true);
		expect(newRun.flags).toContain(getMtFlagIndex(map, 0, 2, 1));
		expect(newRun.flags).toContain(getMtFlagIndex(map, 0, 3, 1));
		expect(newRun.fog).toEqual(opened.fog);
		const approached = { ...newRun, position: { x: 2, y: 1, l: 0 } };
		const crossedAgain = accepted(approached, 2, 1, 1, 0);
		expect(crossedAgain.blockedDoor).toBeUndefined();
		expect(crossedAgain.session.position).toEqual({ x: 3, y: 1, l: 0 });
	});

	it('draws a previously opened door as open without supplying client flags', () => {
		const skin = getDungeonSkin('cave');
		expect(skin).not.toBeNull();
		const doorFlag = getMtFlagIndex(map, 0, 3, 1);
		const scene = buildMtDungeonScene({
			map,
			level: 0,
			viewX: 0,
			viewY: 0,
			skin: skin!,
			noiseAt: () => 80,
			flags: new Set([doorFlag]),
			scenarioIcons: []
		});
		expect(scene.features.find(feature => feature.kind === 'door' && feature.x === 3 && feature.y === 1)).toMatchObject(
			{ kind: 'door', opened: true }
		);
	});
});
