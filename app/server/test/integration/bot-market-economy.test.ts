import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { MARKET_EXPIRATION_JOB_KEY } from '@dinorpg/core/models/market/constants.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	createBotMarketOffer,
	getBotIngredientReserve,
	getBotMarketOfferPlan
} from '../../src/Bot/Service/botMarket.service.js';
import { getBotItinerantSalePlan } from '../../src/Bot/Service/botItinerantMerchant.service.js';
import { getBotInventoryForecast } from '../../src/Bot/Service/botInventoryForecast.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot market economy', () => {
	it('keeps inventory reserves and only sells real surplus', async () => {
		const user = await createTestUser({
			name: 'MarketReserveBot',
			withTutorial: false
		});

		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.SOS_HELMET].itemId,
				quantity: 10
			}
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.MEROU_LUJIDANE,
				quantity: 20
			}
		});

		const plan = await getBotMarketOfferPlan(user.id);

		expect(plan).not.toBeNull();
		expect(plan?.items).toContainEqual({
			itemId: itemList[Item.SOS_HELMET].itemId,
			quantity: 8
		});
		expect(plan?.ingredients).toContainEqual({
			ingredientId: Ingredient.MEROU_LUJIDANE,
			quantity: 10
		});
		expect(getBotIngredientReserve(Ingredient.MEROU_LUJIDANE)).toBe(10);
	});

	it('creates one real market offer and removes only offered surplus', async () => {
		const user = await createTestUser({
			name: 'MarketOfferBot',
			withTutorial: false
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE,
			canRename: false
		});
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.SOS_HELMET].itemId,
				quantity: 10
			}
		});
		await prisma.jobDefinition.create({
			data: {
				key: MARKET_EXPIRATION_JOB_KEY,
				name: 'Expire market offers',
				type: 'INTERVAL',
				timezone: 'UTC',
				intervalMs: null,
				nextRunAt: null,
				lockTimeoutS: 30,
				enabled: true
			}
		});

		await expect(createBotMarketOffer(user.id)).resolves.toBe(true);

		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: user.id
			},
			include: {
				items: true
			}
		});
		expect(offer.total).toBe(1200);
		expect(offer.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					itemId: itemList[Item.SOS_HELMET].itemId,
					quantity: 8,
					isIngredient: false
				})
			])
		);

		const remaining = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: itemList[Item.SOS_HELMET].itemId
				}
			}
		});
		expect(remaining.quantity).toBe(2);
		await expect(getBotMarketOfferPlan(user.id)).resolves.toBeNull();
	});

	it('does not create a market offer below the minimum useful value', async () => {
		const user = await createTestUser({
			name: 'MarketSmallSurplusBot',
			withTutorial: false
		});
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: itemList[Item.SOS_HELMET].itemId,
				quantity: 3
			}
		});

		await expect(getBotMarketOfferPlan(user.id)).resolves.toBeNull();
	});
});

describe('bot itinerant merchant economy', () => {
	it('sells only ingredient quantities above the shared reserve', async () => {
		const user = await createTestUser({
			name: 'ItinerantSurplusBot',
			withTutorial: false
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.MEROU_LUJIDANE,
				quantity: 17
			}
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.POISSON_VENGEUR,
				quantity: 5
			}
		});

		const plan = await getBotItinerantSalePlan(
			user.id,
			shopListV2.ITINERANT_MERCHANT_FRIDAY.shopId
		);

		expect(plan).not.toBeNull();
		expect(plan?.ingredients).toContainEqual({
			itemId: Ingredient.MEROU_LUJIDANE,
			quantity: 7
		});
		expect(plan?.ingredients).not.toContainEqual(
			expect.objectContaining({
				itemId: Ingredient.POISSON_VENGEUR
			})
		);
		expect(plan?.totalGold).toBe(700);
	});
	it('reserves all remaining ingredient needs from an active mission', async () => {
		const user = await createTestUser({
			name: 'MarketMissionForecastBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		const mission = missionList.find(definition => definition.key === 'elmaair')!;
		const firstUseIngredient = mission.goals.findIndex(goal => goal.type === 'USE_INGREDIENT');

		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'elmaair',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		const forecast = await getBotInventoryForecast(user.id);
		expect(forecast.ingredients.get(Ingredient.ENERGIE_AIR)).toBe(5);

		await prisma.dinozMissions.updateMany({
			where: {
				dinozId: dinoz.id,
				missionKey: 'elmaair'
			},
			data: {
				progression: firstUseIngredient + 1
			}
		});

		const remainingForecast = await getBotInventoryForecast(user.id);
		expect(remainingForecast.ingredients.get(Ingredient.ENERGIE_AIR)).toBe(3);
	});

	it('does not sell mission-reserved ingredients on the market', async () => {
		const user = await createTestUser({
			name: 'MarketMissionReserveBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'elmaair',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.ENERGIE_AIR,
				quantity: 10
			}
		});

		const plan = await getBotMarketOfferPlan(user.id);

		expect(plan?.ingredients ?? []).not.toContainEqual(
			expect.objectContaining({
				ingredientId: Ingredient.ENERGIE_AIR
			})
		);
	});

	it('keeps mission-reserved ingredients when meeting the itinerant merchant', async () => {
		const user = await createTestUser({
			name: 'ItinerantMissionReserveBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'elmaair',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.ENERGIE_AIR,
				quantity: 10
			}
		});

		const plan = await getBotItinerantSalePlan(
			user.id,
			shopListV2.ITINERANT_MERCHANT_MONDAY.shopId
		);

		expect(plan?.ingredients ?? []).not.toContainEqual(
			expect.objectContaining({
				itemId: Ingredient.ENERGIE_AIR
			})
		);
	});

	it('reserves mission items from the market as well', async () => {
		const user = await createTestUser({
			name: 'MarketMissionItemReserveBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'skul1',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		const mission = missionList.find(definition => definition.key === 'skul1')!;
		const itemGoal = mission.goals.find(goal => goal.type === 'USE_ITEM');
		expect(itemGoal?.type).toBe('USE_ITEM');
		if (!itemGoal || itemGoal.type !== 'USE_ITEM') {
			throw new Error('Expected skul1 to contain a USE_ITEM goal');
		}

		const item = Object.values(itemList).find(entry => entry.name === itemGoal.itemKey)!;
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: item.itemId,
				quantity: 10
			}
		});

		const forecast = await getBotInventoryForecast(user.id);
		expect(forecast.items.get(item.itemId)).toBe(itemGoal.quantity);

		const plan = await getBotMarketOfferPlan(user.id);
		const soldQuantity =
			plan?.items.find(entry => entry.itemId === item.itemId)?.quantity ?? 0;

		expect(soldQuantity).toBeLessThanOrEqual(
			10 - itemGoal.quantity
		);
	});

});
