import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser, TEST_USER_PASSWORD } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('integration factories', () => {
	describe('user factory', () => {
		it('creates a complete test user', async () => {
			const user = await createTestUser({
				name: 'FactoryPlayer'
			});
			expect(user.name).toBe('FactoryPlayer');
			expect(user.profile).not.toBeNull();
			expect(user.ranking).not.toBeNull();
			expect(user.wallets).toHaveLength(2);
			expect(user.wallets).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						type: 'GOLD'
					}),
					expect.objectContaining({
						type: 'TREASURE_TICKET'
					})
				])
			);
			expect(user.scenarios).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						scenarioKey: 'tutorial',
						progression: 0
					})
				])
			);
		});

		it('creates unique users by default', async () => {
			const firstUser = await createTestUser();
			const secondUser = await createTestUser();
			expect(firstUser.id).not.toBe(secondUser.id);
			expect(firstUser.name).not.toBe(secondUser.name);
		});

		it('allows optional relations to be disabled', async () => {
			const user = await createTestUser({
				withProfile: false,
				withRanking: false,
				withWallets: false,
				withTutorial: false
			});
			expect(user.profile).toBeNull();
			expect(user.ranking).toBeNull();
			expect(user.wallets).toEqual([]);
			expect(user.scenarios).toEqual([]);
		});

		it('exports a valid default test password', () => {
			expect(TEST_USER_PASSWORD.length).toBeGreaterThanOrEqual(6);
		});

		it('creates a ShopKeeper player when requested', async () => {
			const user = await createTestUser({
				shopKeeper: true
			});
			expect(user.shopKeeper).toBe(true);
		});
	});

	describe('dinoz factory', () => {
		it('creates a valid Dinoz for a user', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id
			});
			expect(dinoz.userId).toBe(user.id);
			expect(dinoz).toMatchObject({
				level: 1,
				life: 100,
				maxLife: 100,
				experience: 0,
				raceId: RaceEnum.MOUEFFE,
				placeId: PlaceEnum.DINOVILLE,
				remaining: 3,
				fight: true,
				gather: true,
				canRename: true
			});
			expect(dinoz.seed).toBeTypeOf('string');
			expect(dinoz.display).toHaveLength(16);
		});

		it('uses the initial element stats of the selected race', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				raceId: RaceEnum.MOUEFFE
			});
			expect(dinoz.nbrUpFire).toBe(2);
			expect(dinoz.nbrUpWood).toBe(0);
			expect(dinoz.nbrUpWater).toBe(0);
			expect(dinoz.nbrUpLightning).toBe(0);
			expect(dinoz.nbrUpAir).toBe(0);
		});

		it('allows Dinoz properties to be overridden', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				name: 'Veteran',
				level: 10,
				life: 80,
				maxLife: 120,
				experience: 450,
				placeId: PlaceEnum.PORT_DE_PRECHE,
				remaining: 1
			});
			expect(dinoz).toMatchObject({
				name: 'Veteran',
				level: 10,
				life: 80,
				maxLife: 120,
				experience: 450,
				placeId: PlaceEnum.PORT_DE_PRECHE,
				remaining: 1
			});
		});

		it('creates multiple Dinoz for the same user', async () => {
			const user = await createTestUser();
			const firstDinoz = await createTestDinoz({
				userId: user.id
			});
			const secondDinoz = await createTestDinoz({
				userId: user.id
			});
			expect(firstDinoz.id).not.toBe(secondDinoz.id);
			expect(firstDinoz.name).not.toBe(secondDinoz.name);
			const dinozCount = await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			});
			expect(dinozCount).toBe(2);
		});
	});
});
