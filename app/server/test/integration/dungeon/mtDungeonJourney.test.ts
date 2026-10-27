import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import type { DungeonStructure } from '@dinorpg/core/models/dungeon/dungeon.types.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import {
	type MtDungeonSessionDependencies,
	openMtDungeonSession,
	submitMtDungeonCommands
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

// Synthetic movement fixture. No HTTP, combat, or reward is falsely simulated.
const map: DungeonStructure = {
	width: 4,
	height: 4,
	levels: [
		{
			table: Array.from({ length: 4 }, () => Array(4).fill(true) as boolean[]),
			rooms: [{ id: 0, x: 0, y: 0, w: 4, h: 4, doors: [], item: { kind: 'IKey', x: 2, y: 1, value: 3 } }]
		}
	],
	start: { x: 1, y: 1, l: 0 },
	exit: { x: 3, y: 3, l: 0 }
};
const config = { mapId: 'stepp_0', map };
const deps: MtDungeonSessionDependencies = {
	repository: prismaMtDungeonRunRepository,
	getConfiguration: id => {
		if (id !== config.mapId) throw new Error(`Unexpected stage ${id}`);
		return config;
	},
	withLock: (_userId, fn) => fn(),
	beforeOpen: async () => {}
};

beforeEach(async () => {
	await cleanDatabase();
});

describe('MT dungeon journey — real PostgreSQL session persistence', () => {
	it('persists key pickup and fog across a fresh database read and rejects stale replay', async () => {
		const user = await createTestUser();
		const leader = await createTestDinoz({ userId: user.id, canRename: false });
		const identity = { userId: user.id, leaderDinozId: leader.id };
		const initial = await openMtDungeonSession(deps, identity, config.mapId);
		expect(initial.revision).toBe(0);
		const command = { ...map.start, dx: 1, dy: 0, dl: 0 };
		const result = await submitMtDungeonCommands(deps, identity, [command], initial.revision);
		expect(result.ok).toBe(true);
		if (!result.ok) throw new Error('Unexpected rejection');
		expect(result.session.keys).toEqual([false, false, false, true]);
		expect(result.session.flags).toContain(getMtFlagIndex(map, 0, 2, 1));

		// Reload via Prisma, not from the in-memory response object.
		const fromDatabase = await prismaMtDungeonRunRepository.load(identity);
		expect(fromDatabase).not.toBeNull();
		expect(fromDatabase?.position).toEqual({ x: 2, y: 1, l: 0 });
		expect(fromDatabase?.keys).toEqual(result.session.keys);
		expect(fromDatabase?.flags).toEqual(result.session.flags);
		expect(fromDatabase?.fog).toEqual(result.session.fog);
		expect(fromDatabase?.revision).toBe(result.session.revision);
		await expect(submitMtDungeonCommands(deps, identity, [command], initial.revision)).rejects.toMatchObject({
			code: 'conflict'
		});
		expect((await prismaMtDungeonRunRepository.load(identity))?.revision).toBe(result.session.revision);
	});

	it('refuses duplicate entry and cross-account access, even when the leader ID is known', async () => {
		const owner = await createTestUser();
		const other = await createTestUser();
		const leader = await createTestDinoz({ userId: owner.id, canRename: false });
		const identity = { userId: owner.id, leaderDinozId: leader.id };
		await openMtDungeonSession(deps, identity, config.mapId);
		await expect(openMtDungeonSession(deps, identity, config.mapId)).rejects.toMatchObject({ code: 'already-exists' });
		const intruder = { userId: other.id, leaderDinozId: leader.id };
		expect(await prismaMtDungeonRunRepository.load(intruder)).toBeNull();
		await expect(
			submitMtDungeonCommands(deps, intruder, [{ ...map.start, dx: 1, dy: 0, dl: 0 }], 0)
		).rejects.toMatchObject({ code: 'not-found' });
		expect(
			await prismaMtDungeonRunRepository.createIfAbsent(intruder, (await prismaMtDungeonRunRepository.load(identity))!)
		).toBe(false);
	});

	it('rejects a stale direct CAS and retains the last committed checkpoint', async () => {
		const user = await createTestUser();
		const leader = await createTestDinoz({ userId: user.id, canRename: false });
		const identity = { userId: user.id, leaderDinozId: leader.id };
		await openMtDungeonSession(deps, identity, config.mapId);
		const one = await submitMtDungeonCommands(deps, identity, [{ ...map.start, dx: 1, dy: 0, dl: 0 }], 0);
		if (!one.ok) throw new Error('Unexpected rejection');
		const candidate = { ...one.session, revision: one.session.revision + 1 };
		expect(await prismaMtDungeonRunRepository.compareAndSwap(identity, 0, candidate)).toBe(false);
		const persisted = await prismaMtDungeonRunRepository.load(identity);
		expect(persisted?.revision).toBe(one.session.revision);
		expect(persisted?.position).toEqual(one.session.position);
	});
});
