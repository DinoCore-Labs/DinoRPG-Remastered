import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtDungeonSession,
	type MtSessionConfiguration
} from '@dinorpg/core/models/dungeon/dungeon.session.js';
import type { DungeonStructure } from '@dinorpg/core/models/dungeon/dungeon.types.js';
import { describe, expect, it } from 'vitest';

import {
	moveMtDungeonToAdjacentStage,
	type MtDungeonSessionDependencies
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';

function cfg(id: string): MtSessionConfiguration {
	const map: DungeonStructure = {
		width: 3,
		height: 3,
		levels: [
			{
				table: Array.from({ length: 3 }, () => [true, true, true]),
				rooms: [{ id: 0, x: 0, y: 0, w: 3, h: 3, doors: [], item: null }]
			}
		],
		start: { x: 0, y: 0, l: 0 },
		exit: { x: 2, y: 2, l: 0 }
	};
	return { mapId: id, map };
}
const identity = { userId: 'user-1', leaderDinozId: 21 };
function fixture() {
	let state: MtDungeonSession | null = null;
	let casCalls = 0;
	const deps: MtDungeonSessionDependencies = {
		getConfiguration: cfg,
		getStageCount: id => (id === 'stepp' ? 2 : 1),
		withLock: async (_user, fn) => fn(),
		repository: {
			async load() {
				return state === null ? null : structuredClone(state);
			},
			async createIfAbsent(_who, run) {
				if (state) return false;
				state = structuredClone(run);
				return true;
			},
			async compareAndSwap(_who, version, run) {
				casCalls++;
				if (state?.revision !== version) return false;
				state = structuredClone(run);
				return true;
			}
		}
	};
	function installPending() {
		const c = cfg('stepp_0');
		const original = { ...createMtDungeonSession(c), position: { ...c.map.exit } };
		const moved = applyMtDungeonCommandBatch(c, original, [{ ...c.map.exit, dx: 0, dy: 0, dl: 1 }]);
		if (!moved.ok) throw new Error('Expected a MT boundary intent');
		state = structuredClone(moved.session);
		return moved.session.revision;
	}
	return { deps, installPending, getState: () => state, getCasCalls: () => casCalls };
}
describe('Server MT stage transition CAS', () => {
	it('refuses non-pending transition and keeps storage unchanged', async () => {
		const f = fixture();
		await f.deps.repository.createIfAbsent(identity, createMtDungeonSession(cfg('stepp_0')));
		await expect(moveMtDungeonToAdjacentStage(f.deps, identity, 'forward', 0)).rejects.toThrow('wrong-boundary');
		expect(f.getCasCalls()).toBe(0);
	});
	it('transitions exactly once with CAS; stale replay is refused', async () => {
		const f = fixture();
		const revision = f.installPending();
		const result = await moveMtDungeonToAdjacentStage(f.deps, identity, 'forward', revision);
		expect(result.mapId).toBe('stepp_1');
		expect(f.getCasCalls()).toBe(1);
		await expect(moveMtDungeonToAdjacentStage(f.deps, identity, 'forward', revision)).rejects.toMatchObject({
			code: 'conflict'
		});
		expect(f.getCasCalls()).toBe(1);
	});
	it('denies world exit and cannot consume pending boundary', async () => {
		const f = fixture();
		const revision = f.installPending();
		await expect(moveMtDungeonToAdjacentStage(f.deps, identity, 'backward', revision)).rejects.toThrow(
			'world-boundary'
		);
		expect(f.getState()?.pending?.kind).toBe('boundary-exit');
		expect(f.getCasCalls()).toBe(0);
	});
});
