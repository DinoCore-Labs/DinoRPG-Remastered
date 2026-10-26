import { randomUUID } from 'node:crypto';

import { afterAll, describe, expect, it } from 'vitest';

import { Prisma } from '../../../../prisma/index.js';
import { prisma } from '../../../src/prisma.js';

/**
 * Real PostgreSQL tests. The integration.setup.ts test DB guard runs first.
 * These use a unique pool identifier, never the live stepp/katak/etc reserve.
 * They verify the database's atomic primitives; gameplay payout and session
 * settlement are separately covered by mtDungeonGold.service.test.ts.
 */
const dungeonId = `__mt_test_${randomUUID()}`;
const initialGold = 1000;

async function createPool() {
	return prisma.mtDungeonGoldPool.create({ data: { dungeonId, initialGold, remainingGold: initialGold } });
}

async function removePool() {
	await prisma.mtDungeonGoldPool.deleteMany({ where: { dungeonId } });
}

afterAll(removePool);

describe('MT shared gold pool — PostgreSQL integration', () => {
	it('uses compare-and-swap to reject a stale debit without losing gold', async () => {
		await removePool();
		await createPool();
		const first = await prisma.mtDungeonGoldPool.updateMany({
			where: { dungeonId, remainingGold: initialGold },
			data: { remainingGold: { decrement: 250 } }
		});
		expect(first.count).toBe(1);
		const stale = await prisma.mtDungeonGoldPool.updateMany({
			where: { dungeonId, remainingGold: initialGold },
			data: { remainingGold: { decrement: 250 } }
		});
		expect(stale.count).toBe(0);
		expect((await prisma.mtDungeonGoldPool.findUniqueOrThrow({ where: { dungeonId } })).remainingGold).toBe(750);
	});

	it('rolls back the reserve debit when settlement throws', async () => {
		await removePool();
		await createPool();
		await expect(
			prisma.$transaction(
				async tx => {
					const debit = await tx.mtDungeonGoldPool.updateMany({
						where: { dungeonId, remainingGold: initialGold },
						data: { remainingGold: { decrement: 500 } }
					});
					expect(debit.count).toBe(1);
					throw new Error('simulated downstream settlement failure');
				},
				{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
			)
		).rejects.toThrow('simulated downstream settlement failure');
		expect((await prisma.mtDungeonGoldPool.findUniqueOrThrow({ where: { dungeonId } })).remainingGold).toBe(
			initialGold
		);
	});

	it('persists a successful serializable debit', async () => {
		await removePool();
		await createPool();
		await prisma.$transaction(
			async tx => {
				const changed = await tx.mtDungeonGoldPool.updateMany({
					where: { dungeonId, remainingGold: initialGold },
					data: { remainingGold: { decrement: 400 } }
				});
				expect(changed.count).toBe(1);
			},
			{ isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
		);
		expect((await prisma.mtDungeonGoldPool.findUniqueOrThrow({ where: { dungeonId } })).remainingGold).toBe(600);
	});
});
