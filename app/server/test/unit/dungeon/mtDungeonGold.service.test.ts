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
	userWallet: { findUnique: vi.fn(), updateMany: vi.fn() }
}));
vi.mock('../../../src/prisma.js', () => ({
	prisma: { $transaction: (fn: (client: typeof tx) => Promise<unknown>) => fn(tx) }
}));

const identity = { userId: 'test-user', leaderDinozId: 13 };
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

describe('MT dungeon automatic IGold settlement', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		tx.mtDungeonRun.updateMany.mockResolvedValue({ count: 1 });
		tx.userWallet.findUnique.mockResolvedValue({ amount: 400 });
		tx.userWallet.updateMany.mockResolvedValue({ count: 1 });
	});
	it('credits raw 8-bit value and flags exactly the real tile in the same transaction', async () => {
		const result = await settleMtDungeonGoldArrival(identity, 0, pending(), cfg);
		expect(result).toMatchObject({ goldAwarded: 17, walletGold: 417, session: { position: { x: 2, y: 1, l: 0 } } });
		expect(result.session.flags).toContain(getMtFlagIndex(cfg.map, 0, 2, 1));
		expect(tx.mtDungeonRun.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: identity.userId, revision: 0 }),
				data: expect.objectContaining({ flags: [getMtFlagIndex(cfg.map, 0, 2, 1)] })
			})
		);
		expect(tx.userWallet.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({ userId: identity.userId, type: 'GOLD' }),
				data: { amount: { increment: 17 } }
			})
		);
	});
	it('refuses stale revision before crediting any money', async () => {
		tx.mtDungeonRun.updateMany.mockResolvedValue({ count: 0 });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), cfg)).rejects.toMatchObject({ code: 'stale-run' });
		expect(tx.userWallet.updateMany).not.toHaveBeenCalled();
	});
	it('refuses a forged amount or an already-consumed tile', async () => {
		const altered = pending();
		altered.pending!.itemValue = 255;
		await expect(settleMtDungeonGoldArrival(identity, 0, altered, cfg)).rejects.toMatchObject({ code: 'invalid-gold' });
		const used = pending();
		used.flags.push(getMtFlagIndex(cfg.map, 0, 2, 1));
		await expect(settleMtDungeonGoldArrival(identity, 0, used, cfg)).rejects.toMatchObject({ code: 'invalid-gold' });
		expect(tx.mtDungeonRun.updateMany).not.toHaveBeenCalled();
	});
	it('rejects wallet overflow; the real DB transaction rolls back its flag write', async () => {
		tx.userWallet.findUnique.mockResolvedValue({ amount: 2147483640 });
		await expect(settleMtDungeonGoldArrival(identity, 0, pending(), cfg)).rejects.toMatchObject({
			code: 'invalid-wallet'
		});
		expect(tx.userWallet.updateMany).not.toHaveBeenCalled();
	});
});
