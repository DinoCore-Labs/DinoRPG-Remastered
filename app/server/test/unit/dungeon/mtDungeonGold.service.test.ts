import { mtDungeonGoldAward } from '@dinorpg/core/models/dungeon/dungeon.gold.js';
import { MT_DUNGEON_DEFINITIONS } from '@dinorpg/core/models/dungeon/dungeon.mtData.js';
import { getMtFlagIndex } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import {
	applyMtDungeonCommandBatch,
	createMtDungeonSession,
	type MtSessionConfiguration
} from '@dinorpg/core/models/dungeon/dungeon.session.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settleMtDungeonGoldArrival } from '../../../src/Dungeon/Service/mtDungeonGold.service.js';

const tx = vi.hoisted(() => ({
	mtDungeonRun: { updateMany: vi.fn() },
	mtDungeonGoldPool: { upsert: vi.fn(), updateMany: vi.fn() },
	userWallet: { findUnique: vi.fn(), updateMany: vi.fn() }
}));
const transact = vi.hoisted(() => vi.fn());
vi.mock('../../../src/prisma.js', () => ({
	prisma: { $transaction: (...args: unknown[]) => transact(...args) }
}));

const identity = { userId: 'test-user', leaderDinozId: 13 };

// Remastered intentionally increases the original MT dungeon gold budgets.
// Keep tests tied to the active game configuration, not to a historical literal.
const magneticCaverns = MT_DUNGEON_DEFINITIONS.fr.find(dungeon => dungeon.id === 'stepp');
if (!magneticCaverns) throw new Error('Définition des Cavernes Magnétiques introuvable');
const CONFIGURED_MT_GOLD = magneticCaverns.gold;
const FIRST_AWARD = mtDungeonGoldAward(17, CONFIGURED_MT_GOLD, CONFIGURED_MT_GOLD);
const SECOND_AWARD = mtDungeonGoldAward(17, CONFIGURED_MT_GOLD - FIRST_AWARD, CONFIGURED_MT_GOLD);
const cfg: MtSessionConfiguration = {
	mapId: 'stepp_0',
	map: {
		width: 4,
		height: 4,
		levels: [
			{
				table: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => true)),
				rooms: [{ id: 0, x: 0, y: 0, w: 4, h: 4, doors: [], item: { kind: 'IGold', x: 2, y: 1, value: 17 } }]
			}
		],
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 3, y: 3, l: 0 }
	}
};
function pending() {
	const start = createMtDungeonSession(cfg);
	const moved = applyMtDungeonCommandBatch(cfg, start, [{ x: 1, y: 1, l: 0, dx: 1, dy: 0, dl: 0 }]);
	if (!moved.ok) throw new Error(moved.reason);
	return moved.session;
}

let remaining: number;
describe('MT dungeon finite shared gold (one DB transaction)', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		remaining = CONFIGURED_MT_GOLD;
		transact.mockImplementation((fn: (client: typeof tx) => Promise<unknown>) => fn(tx));
		tx.mtDungeonRun.updateMany.mockResolvedValue({ count: 1 });
		tx.mtDungeonGoldPool.upsert.mockImplementation(async () => ({
			initialGold: CONFIGURED_MT_GOLD,
			remainingGold: remaining
		}));
		tx.mtDungeonGoldPool.updateMany.mockImplementation(async ({ where, data }) => {
			if (remaining !== where.remainingGold) return { count: 0 };
			remaining -= data.remainingGold.decrement;
			return { count: 1 };
		});
		tx.userWallet.findUnique.mockResolvedValue({ amount: 400 });
		tx.userWallet.updateMany.mockResolvedValue({ count: 1 });
	});
	it('initializes with MT XML gold and settles wallet, shared reserve and player flag atomically', async () => {
		const result = await settleMtDungeonGoldArrival(identity, 0, pending(), cfg);
		expect(result).toMatchObject({ goldAwarded: FIRST_AWARD, walletGold: 400 + FIRST_AWARD });
		expect(result.session.flags).toContain(getMtFlagIndex(cfg.map, 0, 2, 1));
		expect(tx.mtDungeonGoldPool.upsert).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { dungeonId: 'stepp' },
				create: { dungeonId: 'stepp', initialGold: CONFIGURED_MT_GOLD, remainingGold: CONFIGURED_MT_GOLD }
			})
		);
		expect(tx.mtDungeonGoldPool.updateMany).toHaveBeenCalledWith({
			where: { dungeonId: 'stepp', remainingGold: CONFIGURED_MT_GOLD },
			data: { remainingGold: { decrement: FIRST_AWARD } }
		});
		expect(remaining).toBe(CONFIGURED_MT_GOLD - FIRST_AWARD);
		expect(tx.userWallet.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: identity.userId, type: 'GOLD' }),
				data: { amount: { increment: FIRST_AWARD } }
			})
		);
		expect(transact).toHaveBeenCalledWith(
			expect.any(Function),
			expect.objectContaining({ isolationLevel: 'Serializable' })
		);
	});
	it('shares the balance across two different players and decreases equal-weight pickups', async () => {
		const first = await settleMtDungeonGoldArrival(identity, 0, pending(), cfg);
		const second = await settleMtDungeonGoldArrival({ userId: 'other-user', leaderDinozId: 91 }, 0, pending(), cfg);
		expect(first.goldAwarded).toBe(FIRST_AWARD);
		expect(second.goldAwarded).toBe(SECOND_AWARD);
		expect(second.goldAwarded).toBeLessThan(first.goldAwarded);
		expect(remaining).toBe(CONFIGURED_MT_GOLD - FIRST_AWARD - SECOND_AWARD);
	});
	it('depleted pool pays zero but marks the one-time pile consumed', async () => {
		remaining = 0;
		const result = await settleMtDungeonGoldArrival(identity, 0, pending(), cfg);
		expect(result.goldAwarded).toBe(0);
		expect(result.walletGold).toBe(400);
		expect(result.session.flags).toContain(getMtFlagIndex(cfg.map, 0, 2, 1));
		expect(tx.mtDungeonGoldPool.updateMany).not.toHaveBeenCalled();
		expect(tx.userWallet.updateMany).not.toHaveBeenCalled();
	});
	it('rejects stale revision before accessing the pool or wallet', async () => {
		tx.mtDungeonRun.updateMany.mockResolvedValue({ count: 0 });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), cfg)).rejects.toMatchObject({ code: 'stale-run' });
		expect(tx.mtDungeonGoldPool.upsert).not.toHaveBeenCalled();
		expect(tx.userWallet.updateMany).not.toHaveBeenCalled();
	});
	it('rejects forged item values and already claimed flags', async () => {
		const forged = pending();
		forged.pending!.itemValue = 255;
		await expect(settleMtDungeonGoldArrival(identity, 0, forged, cfg)).rejects.toMatchObject({ code: 'invalid-gold' });
		const claimed = pending();
		claimed.flags.push(getMtFlagIndex(cfg.map, 0, 2, 1));
		await expect(settleMtDungeonGoldArrival(identity, 0, claimed, cfg)).rejects.toMatchObject({ code: 'invalid-gold' });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), { ...cfg, mapId: 'stepp_999' })).rejects.toThrow();
		expect(tx.mtDungeonRun.updateMany).not.toHaveBeenCalled();
	});
	it('refuses wallet overflow before debiting the common reserve', async () => {
		tx.userWallet.findUnique.mockResolvedValue({ amount: 2147483640 });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), cfg)).rejects.toMatchObject({
			code: 'invalid-wallet'
		});
		expect(tx.mtDungeonGoldPool.updateMany).not.toHaveBeenCalled();
	});
	it('rejects altered pool initial value, preventing silent resets on XML changes', async () => {
		tx.mtDungeonGoldPool.upsert.mockResolvedValue({ initialGold: 1, remainingGold: 1 });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), cfg)).rejects.toMatchObject({
			code: 'invalid-gold'
		});
		expect(tx.userWallet.updateMany).not.toHaveBeenCalled();
	});
	it('retries an optimistic pool conflict and recalculates from the later balance', async () => {
		const original = tx.mtDungeonGoldPool.updateMany.getMockImplementation()!;
		let attempt = 0;
		tx.mtDungeonGoldPool.updateMany.mockImplementation(async input => {
			if (attempt++ === 0) {
				remaining = 100_000; // another user acquired gold between our reads
				return { count: 0 };
			}
			return original(input);
		});
		const result = await settleMtDungeonGoldArrival(identity, 0, pending(), cfg);
		expect(result.goldAwarded).toBe(mtDungeonGoldAward(17, 100_000, CONFIGURED_MT_GOLD));
		expect(transact).toHaveBeenCalledTimes(2);
		expect(remaining).toBe(100_000 - mtDungeonGoldAward(17, 100_000, CONFIGURED_MT_GOLD));
	});
});
