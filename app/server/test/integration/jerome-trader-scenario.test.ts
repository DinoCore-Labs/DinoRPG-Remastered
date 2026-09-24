import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import {
	JEROME_TRADER_REQUIRED_DEVOURER_SEEDS,
	JEROME_TRADER_SCENARIO_KEY,
	JEROME_TRADER_SCENARIO_STEPS,
	JEROME_TRADER_TREASURE_TICKET_REWARD
} from '@dinorpg/core/models/scenarios/data/jeromeTraderScenario.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { MoneyType } from '../../../prisma/index.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
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

async function getScenario(userId: string) {
	return prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: JEROME_TRADER_SCENARIO_KEY
			}
		}
	});
}

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

async function getIngredientQuantity(userId: string, ingredientId: number) {
	const ingredient = await prisma.userIngredients.findUnique({
		where: {
			ingredientId_userId: {
				userId,
				ingredientId
			}
		}
	});
	return ingredient?.quantity ?? 0;
}

async function getTreasureTickets(userId: string) {
	const wallet = await prisma.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: MoneyType.TREASURE_TICKET
			}
		}
	});
	return wallet.amount;
}

async function giveSeeds(userId: string, quantity: number) {
	await prisma.userIngredients.upsert({
		where: {
			ingredientId_userId: {
				userId,
				ingredientId: Ingredient.GRAINE_DE_DEVOREUSE
			}
		},
		create: {
			userId,
			ingredientId: Ingredient.GRAINE_DE_DEVOREUSE,
			quantity
		},
		update: {
			quantity
		}
	});
}

function hasDialog(dialogs: Awaited<ReturnType<typeof listAvailableDialogs>>, dialogId: string) {
	return dialogs.some(dialog => dialog.id === dialogId);
}

async function completeSteppesDialog(userId: string, dinozId: number) {
	let phase = await startDialog({
		userId,
		dinozId,
		dialogId: 'jerome_k_steppes'
	});
	for (const linkId of [
		'ask',
		'ask2',
		'ask3',
		'deriv',
		'deriv2',
		'ask4',
		'ask5',
		'ask6',
		'ask7',
		'ask8',
		'ask9',
		'ask10',
		'ask11',
		'yes',
		'ok'
	]) {
		phase = await selectDialogLink({
			userId,
			dinozId,
			dialogId: 'jerome_k_steppes',
			phaseId: phase.phaseId,
			linkId
		});
	}
	return phase;
}

async function completeDinovilleDialog(userId: string, dinozId: number) {
	let phase = await startDialog({
		userId,
		dinozId,
		dialogId: 'jerome_k_dinoville'
	});
	for (const linkId of ['ask', 'ask2', 'ask3', 'ask4']) {
		phase = await selectDialogLink({
			userId,
			dinozId,
			dialogId: 'jerome_k_dinoville',
			phaseId: phase.phaseId,
			linkId
		});
	}
	return phase;
}

describe('Jerome Trader scenario', () => {
	it('starts at the Steppes when the scenario has not started', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		const dialogs = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(hasDialog(dialogs, 'jerome_k_steppes')).toBe(true);
		expect(await getScenario(user.id)).toBeNull();
	});

	it('does not allow the trade with fewer than 100 Devourer Seeds', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, JEROME_TRADER_REQUIRED_DEVOURER_SEEDS - 1);
		const phase = await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'jerome_k_steppes',
			phaseId: 'ask11',
			linkId: 'yes'
		});
		expect(phase.links.some(link => link.id === 'ok')).toBe(false);
		await expect(
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'jerome_k_steppes',
				phaseId: 'yes',
				linkId: 'ok'
			})
		).rejects.toThrow();
		expect(await getIngredientQuantity(user.id, Ingredient.GRAINE_DE_DEVOREUSE)).toBe(
			JEROME_TRADER_REQUIRED_DEVOURER_SEEDS - 1
		);
		expect(await getItemQuantity(user.id, Item.BAMBOO_FRIEND)).toBe(0);
		expect(await getScenario(user.id)).toBeNull();
	});

	it('trades exactly 100 Devourer Seeds for the Bamboo Friend', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, JEROME_TRADER_REQUIRED_DEVOURER_SEEDS);
		await completeSteppesDialog(user.id, dinoz.id);
		expect(await getIngredientQuantity(user.id, Ingredient.GRAINE_DE_DEVOREUSE)).toBe(0);
		expect(await getItemQuantity(user.id, Item.BAMBOO_FRIEND)).toBe(1);
		const scenario = await getScenario(user.id);
		expect(scenario?.progression).toBe(JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED);
	});

	it('only consumes the required 100 seeds when the player has more', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, 120);
		await completeSteppesDialog(user.id, dinoz.id);
		expect(await getIngredientQuantity(user.id, Ingredient.GRAINE_DE_DEVOREUSE)).toBe(20);
		expect(await getItemQuantity(user.id, Item.BAMBOO_FRIEND)).toBe(1);
	});

	it('makes Jerome available in Dinoville after the first trade', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, JEROME_TRADER_REQUIRED_DEVOURER_SEEDS);
		await completeSteppesDialog(user.id, dinoz.id);
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				placeId: PlaceEnum.DINOVILLE
			}
		});
		const dialogs = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(hasDialog(dialogs, 'jerome_k_dinoville')).toBe(true);
	});

	it('completes the scenario and grants 800 Treasure Tickets', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, JEROME_TRADER_REQUIRED_DEVOURER_SEEDS);
		await completeSteppesDialog(user.id, dinoz.id);
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				placeId: PlaceEnum.DINOVILLE
			}
		});
		const ticketsBefore = await getTreasureTickets(user.id);
		await completeDinovilleDialog(user.id, dinoz.id);
		expect(await getTreasureTickets(user.id)).toBe(ticketsBefore + JEROME_TRADER_TREASURE_TICKET_REWARD);
		const scenario = await getScenario(user.id);
		expect(scenario?.progression).toBe(JEROME_TRADER_SCENARIO_STEPS.COMPLETED);
	});

	it('does not expose either Jerome dialog after completion', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES
		});
		await giveSeeds(user.id, JEROME_TRADER_REQUIRED_DEVOURER_SEEDS);
		await completeSteppesDialog(user.id, dinoz.id);
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				placeId: PlaceEnum.DINOVILLE
			}
		});
		await completeDinovilleDialog(user.id, dinoz.id);
		let dialogs = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(hasDialog(dialogs, 'jerome_k_dinoville')).toBe(false);
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				placeId: PlaceEnum.CONFINS_DES_STEPPES
			}
		});
		dialogs = await listAvailableDialogs({
			userId: user.id,
			dinozId: dinoz.id
		});
		expect(hasDialog(dialogs, 'jerome_k_steppes')).toBe(false);
	});

	it('grants the final 800 Treasure Tickets only once during concurrent validation', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: JEROME_TRADER_SCENARIO_KEY,
				progression: JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED
			}
		});
		const ticketsBefore = await getTreasureTickets(user.id);
		const finish = () =>
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'jerome_k_dinoville',
				phaseId: 'ask3',
				linkId: 'ask4'
			});
		const results = await Promise.allSettled([finish(), finish()]);
		expect(results.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(results.filter(result => result.status === 'rejected')).toHaveLength(1);
		expect(await getTreasureTickets(user.id)).toBe(ticketsBefore + JEROME_TRADER_TREASURE_TICKET_REWARD);
		expect((await getScenario(user.id))?.progression).toBe(JEROME_TRADER_SCENARIO_STEPS.COMPLETED);
	});

	it('rejects a forged second completion after the scenario is completed', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: JEROME_TRADER_SCENARIO_KEY,
				progression: JEROME_TRADER_SCENARIO_STEPS.STOCK_DELIVERED
			}
		});
		const ticketsBefore = await getTreasureTickets(user.id);
		await selectDialogLink({
			userId: user.id,
			dinozId: dinoz.id,
			dialogId: 'jerome_k_dinoville',
			phaseId: 'ask3',
			linkId: 'ask4'
		});
		await expect(
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'jerome_k_dinoville',
				phaseId: 'ask3',
				linkId: 'ask4'
			})
		).rejects.toMatchObject({
			code: 'dialogNotAvailable'
		});
		expect(await getTreasureTickets(user.id)).toBe(ticketsBefore + JEROME_TRADER_TREASURE_TICKET_REWARD);
	});
});
