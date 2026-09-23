import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import {
	JEROME_TRADER_SCENARIO_KEY,
	JEROME_TRADER_SCENARIO_STEPS
} from '@dinorpg/core/models/scenarios/data/jeromeTraderScenario.js';
import { STAR_SCENARIO_KEY, STAR_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/starScenario.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => {
	loadDialogs();
});

beforeEach(async () => {
	await cleanDatabase();
});

async function getItemQuantity(userId: string, itemId: number) {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId
			}
		}
	});
	return item?.quantity ?? 0;
}

describe('dialog atomicity', () => {
	it('grants a Star dialog reward only once during concurrent validation', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.RUINES_ASHPOUK
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: STAR_SCENARIO_KEY,
				progression: STAR_SCENARIO_STEPS.MERGUEZ_SELLER
			}
		});
		/*
		 * Le dialogue Star demande :
		 *
		 * equip(burger)
		 */
		await prisma.dinozItems.create({
			data: {
				dinozId: dinoz.id,
				itemId: Item.CLOUD_BURGER
			}
		});
		await startDialog({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'starquest_merguez_seller'
		});
		await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'starquest_merguez_seller',
			phaseId: 'begin',
			linkId: 'ok'
		});
		const executeReward = () =>
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_merguez_seller',
				phaseId: 'ok',
				linkId: 'star'
			});
		const results = await Promise.allSettled([executeReward(), executeReward()]);
		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					userId: user.id,
					scenarioKey: STAR_SCENARIO_KEY
				}
			}
		});
		expect(scenario.progression).toBe(STAR_SCENARIO_STEPS.MEAT_PIE);
		expect(await getItemQuantity(user.id, Item.MAGIC_STAR)).toBe(1);
	});

	it('consumes Jerome resources and grants the reward only once during concurrent validation', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: Ingredient.GRAINE_DE_DEVOREUSE,
				quantity: 100
			}
		});
		const executeTrade = () =>
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'jerome_k_steppes',
				phaseId: 'yes',
				linkId: 'ok'
			});
		const results = await Promise.allSettled([executeTrade(), executeTrade()]);
		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
		const ingredient = await prisma.userIngredients.findUnique({
			where: {
				ingredientId_userId: {
					userId: user.id,
					ingredientId: Ingredient.GRAINE_DE_DEVOREUSE
				}
			}
		});
		expect(ingredient).toBeNull();
		expect(await getItemQuantity(user.id, Item.BAMBOO_FRIEND)).toBe(1);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					userId: user.id,
					scenarioKey: JEROME_TRADER_SCENARIO_KEY
				}
			}
		});
		expect(scenario.progression).toBe(JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED);
	});
});
