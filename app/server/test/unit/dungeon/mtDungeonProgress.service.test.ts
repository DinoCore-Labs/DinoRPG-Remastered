import { snapshotMtDungeonProgress } from '@dinorpg/core/models/dungeon/dungeon.progress.js';
import {
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration
} from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import {
	type MtDungeonSessionDependencies,
	MtDungeonSessionError,
	type MtSessionIdentity,
	openMtDungeonSession
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';

const identity: MtSessionIdentity = { userId: 'test-progress-user', leaderDinozId: 43 };
function config(): MtSessionConfiguration {
	const table = Array.from({ length: 5 }, () => Array(5).fill(true) as boolean[]);
	return {
		mapId: 'stepp_0',
		map: {
			width: 5,
			height: 5,
			levels: [{ table, rooms: [{ id: 0, x: 0, y: 0, w: 5, h: 5, doors: [], item: null }] }],
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 4, y: 4, l: 0 }
		}
	};
}
function dependencies(saved: unknown | null) {
	const cfg = config();
	let run: MtDungeonSession | null = null;
	const deps: MtDungeonSessionDependencies = {
		getConfiguration: mapId => {
			if (mapId !== cfg.mapId) throw new Error('unknown map');
			return cfg;
		},
		withLock: (_userId, callback) => callback(),
		loadProgress: async () => saved,
		repository: {
			load: async () => run,
			compareAndSwap: async () => false,
			createIfAbsent: async (_id, next) => {
				if (run) return false;
				run = next;
				return true;
			}
		}
	};
	return { deps, cfg, getRun: () => run };
}

describe('MT progress restored on new server-authorized entry', () => {
	it('reuses discoveries after a previous run was deleted', async () => {
		const cfg = config();
		const earlier = createMtDungeonSession(cfg);
		earlier.position = { x: 4, y: 4, l: 0 };
		earlier.flags = [12, 13];
		earlier.keys = [true];
		earlier.fog![3] = 255;
		const { deps, getRun } = dependencies(snapshotMtDungeonProgress(earlier));
		const resumed = await openMtDungeonSession(deps, identity, 'stepp_0');
		expect(resumed.flags).toEqual([12, 13]);
		expect(resumed.keys).toEqual([true]);
		expect(resumed.fog![3]).toBe(255);
		expect(resumed.position).toEqual(cfg.map.start);
		expect(getRun()).toEqual(resumed);
	});

	it('starts an empty dungeon only if no saved progress exists', async () => {
		const { deps } = dependencies(null);
		const opened = await openMtDungeonSession(deps, identity, 'stepp_0');
		expect(opened.flags).toEqual([]);
		expect(opened.stageStates).toEqual({});
	});

	it('rejects an invalid saved snapshot rather than spawning old guardians', async () => {
		const { deps, getRun } = dependencies({ stepp_0: { flags: [999], keys: [], fog: [0] } });
		await expect(openMtDungeonSession(deps, identity, 'stepp_0')).rejects.toMatchObject({ code: 'invalid-run' });
		expect(getRun()).toBeNull();
	});
});
