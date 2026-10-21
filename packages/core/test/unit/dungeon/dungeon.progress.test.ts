import { describe, expect, it } from 'vitest';

import { restoreMtDungeonProgress, snapshotMtDungeonProgress } from '../../../src/models/dungeon/dungeon.progress.js';
import { getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import { createMtDungeonSession, type MtSessionConfiguration } from '../../../src/models/dungeon/dungeon.session.js';

function configuration(mapId: string): MtSessionConfiguration {
	const table = Array.from({ length: 6 }, () => Array(6).fill(true) as boolean[]);
	return {
		mapId,
		map: {
			width: 6,
			height: 6,
			levels: [{ table, rooms: [{ id: 1, x: 0, y: 0, w: 6, h: 6, doors: [], item: null }] }],
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 5, y: 5, l: 0 }
		}
	};
}
const read = (mapId: string) => configuration(mapId);

describe('MT durable discoveries after session deletion', () => {
	it('keeps defeated guardians, items, healing flags and revealed fog on a new visit', () => {
		const cfg = configuration('stepp_0');
		const run = createMtDungeonSession(cfg);
		const flag = getMtFlagIndex(cfg.map, 0, 3, 3);
		run.position = { x: 4, y: 4, l: 0 };
		run.flags = [flag];
		run.keys = [true];
		run.fog = [...run.fog!];
		run.fog![2] = 255;
		const saved = snapshotMtDungeonProgress(run);
		const resumed = restoreMtDungeonProgress(createMtDungeonSession(cfg), saved, read);
		expect(resumed.position).toEqual(cfg.map.start);
		expect(resumed.flags).toContain(flag);
		expect(resumed.keys[0]).toBe(true);
		expect(resumed.fog![2]).toBe(255);
		expect(resumed.pending).toBeNull();
		expect(resumed.revision).toBe(0);
	});

	it('restores snapshots for all previously visited stages', () => {
		const stage0 = createMtDungeonSession(configuration('stepp_0'));
		stage0.flags = [5];
		stage0.stageStates.stepp_1 = {
			flags: [7],
			keys: [true, false],
			fog: [...createMtDungeonSession(configuration('stepp_1')).fog!]
		};
		const saved = snapshotMtDungeonProgress(stage0);
		const next = restoreMtDungeonProgress(createMtDungeonSession(configuration('stepp_0')), saved, read);
		expect(next.stageStates.stepp_1?.flags).toEqual([7]);
		const reenterStage1 = restoreMtDungeonProgress(createMtDungeonSession(configuration('stepp_1')), saved, read);
		expect(reenterStage1.flags).toEqual([7]);
	});

	it('copies values rather than mutating a stored snapshot', () => {
		const run = createMtDungeonSession(configuration('stepp_0'));
		const saved = snapshotMtDungeonProgress(run);
		const loaded = restoreMtDungeonProgress(createMtDungeonSession(configuration('stepp_0')), saved, read);
		loaded.flags.push(5);
		expect(saved.stepp_0?.flags).toEqual([]);
	});

	it('rejects corrupt flags and truncated fog rather than resetting data', () => {
		const fresh = createMtDungeonSession(configuration('stepp_0'));
		expect(() =>
			restoreMtDungeonProgress(fresh, { stepp_0: { keys: [], flags: [999999], fog: fresh.fog } }, read)
		).toThrow();
		expect(() => restoreMtDungeonProgress(fresh, { stepp_0: { keys: [], flags: [], fog: [0] } }, read)).toThrow();
		expect(() =>
			restoreMtDungeonProgress(fresh, { mquetz_0: { keys: [], flags: [], fog: fresh.fog } }, read)
		).toThrow();
	});
});
