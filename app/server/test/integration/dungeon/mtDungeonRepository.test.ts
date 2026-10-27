import { createMtDungeonSession, type MtSessionConfiguration } from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { prismaMtDungeonRunRepository as repository } from '../../../src/Dungeon/Repository/prismaMtDungeonRun.repository.js';

const db = vi.hoisted(() => ({
	mtDungeonRun: { findFirst: vi.fn(), updateMany: vi.fn(), create: vi.fn() },
	dinoz: { findFirst: vi.fn() }
}));
vi.mock('../../../src/prisma.js', () => ({ prisma: db }));

const identity = { userId: 'user-43', leaderDinozId: 43 };
const cfg: MtSessionConfiguration = {
	mapId: 'stepp_0',
	map: {
		width: 3,
		height: 3,
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 2, y: 2, l: 0 },
		levels: [
			{
				table: Array.from({ length: 3 }, () => [true, true, true]),
				rooms: [{ id: 0, x: 0, y: 0, w: 3, h: 3, doors: [], item: null }]
			}
		]
	}
};

function storedRow() {
	const run = createMtDungeonSession(cfg);
	return {
		id: 'run-43',
		userId: identity.userId,
		leaderDinozId: identity.leaderDinozId,
		mapId: run.mapId,
		revision: run.revision,
		x: run.position.x,
		y: run.position.y,
		l: run.position.l,
		keys: run.keys,
		flags: run.flags,
		fog: run.fog === null ? null : Uint8Array.from(run.fog),
		locked: run.locked,
		pending: null,
		stageStates: {}
	};
}

describe('MT step 43 — Prisma repository integration boundary', () => {
	beforeEach(() => vi.resetAllMocks());

	it('always restricts load to both player and leader ownership', async () => {
		db.mtDungeonRun.findFirst.mockResolvedValue(storedRow());
		const run = await repository.load(identity);
		expect(run).toMatchObject({ mapId: 'stepp_0', revision: 0 });
		expect(db.mtDungeonRun.findFirst).toHaveBeenCalledWith({
			where: {
				userId: identity.userId,
				leaderDinozId: identity.leaderDinozId,
				leaderDinoz: { userId: identity.userId }
			}
		});
	});

	it('rejects missing runs without manufacturing progress', async () => {
		db.mtDungeonRun.findFirst.mockResolvedValue(null);
		expect(await repository.load(identity)).toBeNull();
	});

	it('performs compare-and-swap on player, leader and expected revision', async () => {
		db.mtDungeonRun.updateMany.mockResolvedValue({ count: 0 });
		const next = { ...createMtDungeonSession(cfg), revision: 1 };
		expect(await repository.compareAndSwap(identity, 0, next)).toBe(false);
		expect(db.mtDungeonRun.updateMany).toHaveBeenCalledWith({
			where: { userId: identity.userId, leaderDinozId: identity.leaderDinozId, revision: 0 },
			data: expect.objectContaining({ mapId: 'stepp_0', revision: 1, x: 1, y: 1, l: 0 })
		});
		await expect(repository.compareAndSwap(identity, 1, next)).rejects.toThrow('revision must increase');
		expect(db.mtDungeonRun.updateMany).toHaveBeenCalledTimes(1);
	});

	it('requires an owned group leader before creating a session', async () => {
		db.dinoz.findFirst.mockResolvedValue(null);
		expect(await repository.createIfAbsent(identity, createMtDungeonSession(cfg))).toBe(false);
		expect(db.mtDungeonRun.create).not.toHaveBeenCalled();
		expect(db.dinoz.findFirst).toHaveBeenCalledWith({
			where: { id: identity.leaderDinozId, userId: identity.userId, leaderId: null },
			select: { id: true }
		});
	});

	it('persists stage flags and keys in the same run write', async () => {
		db.mtDungeonRun.updateMany.mockResolvedValue({ count: 1 });
		const next = {
			...createMtDungeonSession(cfg),
			revision: 3,
			keys: [true, false],
			flags: [2],
			stageStates: { stepp_1: { keys: [true], flags: [1], fog: null } }
		};
		expect(await repository.compareAndSwap(identity, 2, next)).toBe(true);
		expect(db.mtDungeonRun.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					keys: [true, false],
					flags: [2],
					stageStates: { stepp_1: { keys: [true], flags: [1], fog: null } }
				})
			})
		);
	});
});
