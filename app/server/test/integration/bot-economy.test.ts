import { beforeEach, describe, expect, it } from 'vitest';

import { canBotBuyAnotherDinoz, buyBotDinoz } from '../../src/Bot/Service/botEconomy.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot economy', () => {
	it('buys a second Dinoz while keeping the configured gold reserve', async () => {
		const user = await createTestUser({
			name: 'EconomyBot',
			withTutorial: false
		});
		await createTestDinoz({
			userId: user.id,
			canRename: false
		});

		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: 50_000
			}
		});

		await expect(canBotBuyAnotherDinoz(user.id)).resolves.toBe(true);
		const created = await buyBotDinoz(user.id);
		expect(created).not.toBeNull();

		const dinoz = await prisma.dinoz.findMany({
			where: { userId: user.id },
			orderBy: { id: 'asc' }
		});
		expect(dinoz).toHaveLength(2);
		expect(dinoz[1].canRename).toBe(false);
		expect(dinoz[1].name).toBe(`Dinoz-${dinoz[1].id}`);

		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBeGreaterThanOrEqual(1500);
	});
});
