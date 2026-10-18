import type { MtDungeonSession, MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { describe, expect, it } from 'vitest';

import {
	type MtDungeonSessionDependencies,
	MtDungeonSessionError,
	type MtSessionIdentity,
	openMtDungeonSession,
	resolveMtDungeonInteraction,
	submitMtDungeonCommands
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';

const identity: MtSessionIdentity = { userId: 'mt-test-user', leaderDinozId: 17 };
function setup() {
	const table = Array.from({ length: 5 }, (_, x) =>
		Array.from({ length: 5 }, (_, y) => x > 0 && y > 0 && x < 4 && y < 4)
	);
	const cfg: MtSessionConfiguration = {
		mapId: 'stepp_0',
		map: {
			width: 5,
			height: 5,
			levels: [{ table, rooms: [{ id: 0, x: 1, y: 1, w: 3, h: 3, doors: [], item: null }] }],
			start: { x: 1, y: 1, l: 0 },
			exit: { x: 3, y: 3, l: 0 }
		}
	};
	const memory = new Map<string, MtDungeonSession>();
	const key = (i: MtSessionIdentity) => `${i.userId}/${i.leaderDinozId}`;
	let failCas = false;
	const deps: MtDungeonSessionDependencies = {
		getConfiguration: name => {
			if (name !== cfg.mapId) throw new Error('unknown map');
			return cfg;
		},
		withLock: (_userId, callback) => callback(),
		repository: {
			load: async i => memory.get(key(i)) ?? null,
			createIfAbsent: async (i, v) => {
				if (memory.has(key(i))) return false;
				memory.set(key(i), v);
				return true;
			},
			compareAndSwap: async (i, revision, v) => {
				const old = memory.get(key(i));
				if (failCas || !old || old.revision !== revision) return false;
				memory.set(key(i), v);
				return true;
			}
		}
	};
	return {
		deps,
		memory,
		key,
		blockCas: () => {
			failCas = true;
		}
	};
}
describe('MT server session adapter', () => {
	it('cannot submit a command until a trusted server entry created a session', async () => {
		const { deps } = setup();
		await expect(
			submitMtDungeonCommands(deps, identity, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }])
		).rejects.toMatchObject({ code: 'not-found' });
	});
	it('opens once, and binds snapshots to user+leader', async () => {
		const { deps } = setup();
		await openMtDungeonSession(deps, identity, 'stepp_0');
		await expect(openMtDungeonSession(deps, identity, 'stepp_0')).rejects.toMatchObject({ code: 'already-exists' });
		await expect(
			submitMtDungeonCommands(deps, { ...identity, userId: 'other' }, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }])
		).rejects.toMatchObject({ code: 'not-found' });
	});
	it('saves a legitimate MT move with incremented revision', async () => {
		const { deps, memory, key } = setup();
		await openMtDungeonSession(deps, identity, 'stepp_0');
		const result = await submitMtDungeonCommands(deps, identity, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
		expect(result).toMatchObject({ ok: true, session: { position: { x: 2, y: 1, l: 0 }, revision: 1 } });
		expect(memory.get(key(identity))?.revision).toBe(1);
	});
	it('does not save rejected batches', async () => {
		const { deps, memory, key } = setup();
		await openMtDungeonSession(deps, identity, 'stepp_0');
		const result = await submitMtDungeonCommands(deps, identity, [{ x: 8, y: 9, l: 0, dx: 1, dy: 0, dl: 0 }]);
		expect(result).toMatchObject({ ok: false, reason: 'stale-position' });
		expect(memory.get(key(identity))?.revision).toBe(0);
	});
	it('refuses to silently save over a newer session', async () => {
		const { deps, blockCas } = setup();
		await openMtDungeonSession(deps, identity, 'stepp_0');
		blockCas();
		await expect(
			submitMtDungeonCommands(deps, identity, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }])
		).rejects.toMatchObject({ code: 'conflict' });
	});
	it('exposes no public event settlement API and rejects resolution without pending event', async () => {
		const { deps } = setup();
		await openMtDungeonSession(deps, identity, 'stepp_0');
		await expect(resolveMtDungeonInteraction(deps, identity, true)).rejects.toThrow('No valid pending');
	});
});
