import { describe, expect, it, vi } from 'vitest';

import {
	detachDeadMtDungeonFollowers,
	mtDungeonLeaderIsDead
} from '../../../src/Dungeon/Service/mtDungeonCasualties.service.js';

const identity = { userId: 'user-1', leaderDinozId: 11 };

describe('MT dungeon casualty handling', () => {
	it('detaches only dead followers and never the leader', async () => {
		const db: any = {
			dinoz: {
				findFirst: vi.fn().mockResolvedValue({ life: 14 }),
				findMany: vi.fn().mockResolvedValue([{ id: 13 }]),
				updateMany: vi.fn().mockResolvedValue({ count: 1 })
			}
		};
		expect(await detachDeadMtDungeonFollowers(db, identity)).toEqual([13]);
		expect(db.dinoz.findMany).toHaveBeenCalledWith({
			where: { userId: 'user-1', leaderId: 11, life: { lte: 0 } },
			select: { id: true }
		});
		expect(db.dinoz.updateMany).toHaveBeenCalledWith({
			where: { userId: 'user-1', leaderId: 11, id: { in: [13] }, life: { lte: 0 } },
			data: { leaderId: null }
		});
	});

	it('does not detach any survivor', async () => {
		const db: any = {
			dinoz: {
				findFirst: vi.fn().mockResolvedValue({ life: 1 }),
				findMany: vi.fn().mockResolvedValue([]),
				updateMany: vi.fn()
			}
		};
		expect(await detachDeadMtDungeonFollowers(db, identity)).toEqual([]);
		expect(db.dinoz.updateMany).not.toHaveBeenCalled();
	});

	it('requires evacuation rather than detaching a dead leader', async () => {
		const db: any = {
			dinoz: {
				findFirst: vi.fn().mockResolvedValue({ life: 0 }),
				findMany: vi.fn(),
				updateMany: vi.fn()
			}
		};
		expect(await mtDungeonLeaderIsDead(db, identity)).toBe(true);
		expect(await detachDeadMtDungeonFollowers(db, identity)).toEqual([]);
		expect(db.dinoz.findMany).not.toHaveBeenCalled();
	});

	it('rejects a missing or wrongly linked leader', async () => {
		const db: any = { dinoz: { findFirst: vi.fn().mockResolvedValue(null) } };
		await expect(detachDeadMtDungeonFollowers(db, identity)).rejects.toMatchObject({ code: 'invalid-party' });
	});

	it('fails closed when a follower changed between read and update', async () => {
		const db: any = {
			dinoz: {
				findFirst: vi.fn().mockResolvedValue({ life: 20 }),
				findMany: vi.fn().mockResolvedValue([{ id: 13 }]),
				updateMany: vi.fn().mockResolvedValue({ count: 0 })
			}
		};
		await expect(detachDeadMtDungeonFollowers(db, identity)).rejects.toMatchObject({ code: 'conflict' });
	});
});
