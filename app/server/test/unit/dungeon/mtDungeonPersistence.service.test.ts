import type { DungeonStructure } from '@dinorpg/core/models/dungeon/dungeon.types.js';
import { describe, expect, it } from 'vitest';

import {
	type MtDungeonSessionDependencies,
	MtDungeonSessionError,
	type MtDungeonSessionRepository,
	openMtDungeonSession,
	submitMtDungeonCommands
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';

const map: DungeonStructure = {
	width: 3,
	height: 3,
	levels: [
		{
			table: [
				[true, true, true],
				[true, true, true],
				[true, true, true]
			],
			rooms: [{ id: 0, x: 0, y: 0, w: 3, h: 3, doors: [], item: null }]
		}
	],
	start: { x: 1, y: 1, l: 0 },
	exit: { x: 2, y: 2, l: 0 }
};
const identity = { userId: 'test-user', leaderDinozId: 3 };

function fixture(gate: () => Promise<void>) {
	let state: Awaited<ReturnType<MtDungeonSessionRepository['load']>> = null;
	const repository: MtDungeonSessionRepository = {
		async load() {
			return state;
		},
		async createIfAbsent(_who, value) {
			if (state) return false;
			state = structuredClone(value);
			return true;
		},
		async compareAndSwap(_who, revision, value) {
			if (!state || state.revision !== revision) return false;
			state = structuredClone(value);
			return true;
		}
	};
	const deps: MtDungeonSessionDependencies = {
		repository,
		getConfiguration: mapId => ({ map, mapId }),
		withLock: async (_userId, fn) => fn(),
		beforeOpen: gate
	};
	return deps;
}

describe('MT dungeon persisted-session contract', () => {
	it('performs entry permission check inside the lock before creating a run', async () => {
		const deps = fixture(async () => {
			throw new Error('not allowed');
		});
		await expect(openMtDungeonSession(deps, identity, 'stepp_0')).rejects.toThrow('not allowed');
		expect(await deps.repository.load(identity)).toBeNull();
	});

	it('creates only one run for a player/leader', async () => {
		const deps = fixture(async () => {});
		await openMtDungeonSession(deps, identity, 'stepp_0');
		await expect(openMtDungeonSession(deps, identity, 'stepp_0')).rejects.toBeInstanceOf(MtDungeonSessionError);
	});

	it('rejects stale requests by client revision, before replaying any command', async () => {
		const deps = fixture(async () => {});
		await openMtDungeonSession(deps, identity, 'stepp_0');
		await expect(
			submitMtDungeonCommands(deps, identity, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }], 17)
		).rejects.toMatchObject({ code: 'conflict' });
		expect((await deps.repository.load(identity))?.revision).toBe(0);
	});

	it('uses CAS revision after a valid movement and refuses the same replay', async () => {
		const deps = fixture(async () => {});
		await openMtDungeonSession(deps, identity, 'stepp_0');
		const command = { x: 1, y: 1, l: 0, dx: -1, dy: 0, dl: 0 };
		const result = await submitMtDungeonCommands(deps, identity, [command], 0);
		expect(result.ok).toBe(true);
		expect((await deps.repository.load(identity))?.position).toEqual({ x: 0, y: 1, l: 0 });
		await expect(submitMtDungeonCommands(deps, identity, [command], 0)).rejects.toMatchObject({ code: 'conflict' });
	});
});
