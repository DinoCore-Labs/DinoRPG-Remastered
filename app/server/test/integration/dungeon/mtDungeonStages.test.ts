import { createMtDungeonSession, type MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prismaMtDungeonRunRepository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';
import {
	moveMtDungeonToAdjacentStage,
	type MtDungeonSessionDependencies
} from '../../../src/Dungeon/Service/mtDungeonSession.service.js';
import { prisma } from '../../../src/prisma.js';
import { cleanDatabase } from '../../helpers/database.js';
import { createTestDinoz } from '../../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../../helpers/factories/user.factory.js';

function configuration(mapId: string): MtSessionConfiguration {
	return {
		mapId,
		map: {
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
		}
	};
}

const dependencies: MtDungeonSessionDependencies = {
	repository: prismaMtDungeonRunRepository,
	getConfiguration: configuration,
	getStageCount: dungeonId => (dungeonId === 'stepp' ? 2 : 1),
	withLock: async (_userId, fn) => fn()
};

beforeEach(async () => {
	await cleanDatabase();
});

describe('MT dungeon stage transitions — real PostgreSQL persistence', () => {
	async function createRun() {
		const user = await createTestUser();
		const leader = await createTestDinoz({ userId: user.id });
		const identity = { userId: user.id, leaderDinozId: leader.id };
		const initial = createMtDungeonSession(configuration('stepp_0'));
		expect(await prismaMtDungeonRunRepository.createIfAbsent(identity, initial)).toBe(true);
		return { identity, initial };
	}

	it('stores the original stage keys and flags when moving forward, and restores them when going backward', async () => {
		const { identity, initial } = await createRun();
		const outbound = {
			...initial,
			position: { x: 2, y: 2, l: 0 },
			keys: [false, true],
			flags: [4],
			locked: true,
			pending: {
				kind: 'boundary-exit' as const,
				from: { x: 2, y: 2, l: 0 },
				to: { x: 2, y: 2, l: 0 },
				flag: null,
				itemValue: null
			},
			revision: 1
		};
		expect(await prismaMtDungeonRunRepository.compareAndSwap(identity, 0, outbound)).toBe(true);
		const forward = await moveMtDungeonToAdjacentStage(dependencies, identity, 'forward', 1);
		expect(forward.mapId).toBe('stepp_1');
		expect(forward.stageStates.stepp_0).toMatchObject({ keys: [false, true], flags: [4] });
		expect((await prismaMtDungeonRunRepository.load(identity))?.stageStates.stepp_0?.flags).toEqual([4]);
		await expect(moveMtDungeonToAdjacentStage(dependencies, identity, 'forward', 1)).rejects.toMatchObject({
			code: 'conflict'
		});

		const inbound = {
			...forward,
			locked: true,
			pending: {
				kind: 'boundary-start' as const,
				from: { x: 0, y: 0, l: 0 },
				to: { x: 0, y: 0, l: 0 },
				flag: null,
				itemValue: null
			},
			revision: forward.revision + 1
		};
		expect(await prismaMtDungeonRunRepository.compareAndSwap(identity, forward.revision, inbound)).toBe(true);
		const backward = await moveMtDungeonToAdjacentStage(dependencies, identity, 'backward', inbound.revision);
		expect(backward.mapId).toBe('stepp_0');
		expect(backward.keys).toEqual([false, true]);
		expect(backward.flags).toEqual([4]);
		expect(backward.position).toEqual({ x: 2, y: 2, l: 0 });
		expect((await prismaMtDungeonRunRepository.load(identity))?.flags).toEqual([4]);
	});

	it('does not change database state when no boundary was triggered', async () => {
		const { identity } = await createRun();
		await expect(moveMtDungeonToAdjacentStage(dependencies, identity, 'forward', 0)).rejects.toMatchObject({
			code: 'wrong-boundary'
		});
		const row = await prisma.mtDungeonRun.findFirst({ where: identity });
		expect(row?.mapId).toBe('stepp_0');
		expect(row?.revision).toBe(0);
	});

	it('does not expose another player’s session', async () => {
		const { identity } = await createRun();
		const other = await createTestUser();
		expect(await prismaMtDungeonRunRepository.load({ ...identity, userId: other.id })).toBeNull();
	});
});
