import { describe, expect, it, vi } from 'vitest';

import { assertNoMtDungeonHealing } from '../../../src/Dungeon/mtDungeonHealingGuard.js';

vi.mock('../../../src/prisma.js', () => ({ prisma: {} }));

describe('MT dungeon regular healing guard', () => {
	it('blocks leader healing while a session exists', async () => {
		const db: any = {
			dinoz: { findFirst: vi.fn().mockResolvedValue({ leaderId: null }) },
			mtDungeonRun: { findFirst: vi.fn().mockResolvedValue({ id: 'run' }) }
		};
		await expect(assertNoMtDungeonHealing('user', 5, db)).rejects.toThrow('dungeonHealingBlocked');
		expect(db.mtDungeonRun.findFirst).toHaveBeenCalledWith({
			where: { userId: 'user', leaderDinozId: { in: [5] } },
			select: { id: true }
		});
	});
	it('blocks followers by checking their leader, not just their own ID', async () => {
		const db: any = {
			dinoz: { findFirst: vi.fn().mockResolvedValue({ leaderId: 5 }) },
			mtDungeonRun: { findFirst: vi.fn().mockResolvedValue({ id: 'run' }) }
		};
		await expect(assertNoMtDungeonHealing('user', 6, db)).rejects.toThrow('dungeonHealingBlocked');
		expect(db.mtDungeonRun.findFirst).toHaveBeenCalledWith({
			where: { userId: 'user', leaderDinozId: { in: [6, 5] } },
			select: { id: true }
		});
	});
	it('does not block an ordinary outside Dinoz', async () => {
		const db: any = {
			dinoz: { findFirst: vi.fn().mockResolvedValue({ leaderId: null }) },
			mtDungeonRun: { findFirst: vi.fn().mockResolvedValue(null) }
		};
		await expect(assertNoMtDungeonHealing('user', 7, db)).resolves.toBeUndefined();
	});
});
