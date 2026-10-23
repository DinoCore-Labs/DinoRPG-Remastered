import { describe, expect, it, vi } from 'vitest';

import { assertNoMtDungeonHealing } from '../../../src/Dungeon/mtDungeonHealingGuard.js';

vi.mock('../../../src/prisma.js', () => ({ prisma: {} }));
vi.mock('../../../src/Dungeon/Service/mtDungeonRuntime.service.js', () => ({
	getMtDungeonArchive: () => ({
		configuration: () => ({
			map: {
				width: 4,
				height: 4,
				levels: [{ rooms: [{ item: { kind: 'IHeal', x: 2, y: 1, value: 0 } }] }]
			}
		})
	})
}));
const row = { mapId: 'stepp_0', x: 2, y: 1, l: 0, flags: [], locked: false, pending: null };
const dbFor = (value: unknown = row, leaderId: number | null = null) => ({
	dinoz: { findFirst: vi.fn().mockResolvedValue({ leaderId }) },
	mtDungeonRun: { findFirst: vi.fn().mockResolvedValue(value) }
});

describe('MT dungeon manual healing guard', () => {
	it('permits normal healing items only while on a fresh IHeal tile', async () => {
		const db: any = dbFor();
		await expect(assertNoMtDungeonHealing('user', 5, db, true)).resolves.toBeUndefined();
		await expect(assertNoMtDungeonHealing('user', 5, db)).rejects.toThrow('dungeonHealingBlocked');
	});
	it('accepts followers on their leader’s active tile', async () => {
		const db: any = dbFor(row, 5);
		await expect(assertNoMtDungeonHealing('user', 6, db, true)).resolves.toBeUndefined();
		expect(db.mtDungeonRun.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { userId: 'user', leaderDinozId: { in: [6, 5] } }
			})
		);
	});
	it('blocks a consumed, pending, or off-tile zone', async () => {
		for (const bad of [
			{ ...row, flags: [9] },
			{ ...row, pending: { kind: 'scenario' } },
			{ ...row, x: 1 }
		]) {
			await expect(assertNoMtDungeonHealing('user', 5, dbFor(bad) as any, true)).rejects.toThrow(
				'dungeonHealingBlocked'
			);
		}
	});
	it('allows healing outside an active dungeon', async () => {
		await expect(assertNoMtDungeonHealing('user', 7, dbFor(null) as any)).resolves.toBeUndefined();
	});
});
