import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { buyBotDinoz, canBotBuyAnotherDinoz } from '../../src/Bot/Service/botEconomy.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

async function addStatus(dinozId: number, statusId: DinozStatusId) {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

async function setGold(userId: string, amount: number) {
	await prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: 'GOLD'
			}
		},
		data: {
			amount
		}
	});
}

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

		await setGold(user.id, 50_000);

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

	it('keeps the autonomous roster capped at three before Sylvenoire preparation', async () => {
		const user = await createTestUser({
			name: 'EconomyThreeBot',
			withTutorial: false
		});
		for (let index = 0; index < 3; index += 1) {
			await createTestDinoz({
				userId: user.id,
				canRename: false
			});
		}
		await setGold(user.id, 100_000);

		await expect(canBotBuyAnotherDinoz(user.id)).resolves.toBe(false);
	});

	it('expands the roster beyond three once the initial trio has Korgon flippers', async () => {
		const user = await createTestUser({
			name: 'EconomySylvenoireBot',
			withTutorial: false
		});
		const dinoz = [];
		for (let index = 0; index < 3; index += 1) {
			dinoz.push(
				await createTestDinoz({
					userId: user.id,
					canRename: false
				})
			);
		}
		for (const entry of dinoz) {
			await addStatus(entry.id, DinozStatusId.FLIPPERS);
		}
		await setGold(user.id, 100_000);

		await expect(canBotBuyAnotherDinoz(user.id)).resolves.toBe(true);
		const created = await buyBotDinoz(user.id);
		expect(created).not.toBeNull();

		await expect(
			prisma.dinoz.count({
				where: { userId: user.id }
			})
		).resolves.toBe(4);
	});

	it('stops autonomous Sylvenoire roster expansion at seven Dinoz', async () => {
		const user = await createTestUser({
			name: 'EconomySevenBot',
			withTutorial: false
		});
		const dinoz = [];
		for (let index = 0; index < 7; index += 1) {
			dinoz.push(
				await createTestDinoz({
					userId: user.id,
					canRename: false
				})
			);
		}
		for (const entry of dinoz.slice(0, 3)) {
			await addStatus(entry.id, DinozStatusId.FLIPPERS);
		}
		await setGold(user.id, 100_000);

		await expect(canBotBuyAnotherDinoz(user.id)).resolves.toBe(false);
	});

});
