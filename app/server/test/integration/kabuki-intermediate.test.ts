import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { evalTimedRandomCondition } from '@dinorpg/core/models/utils/conditions/evalConditions.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(async () => cleanDatabase());

async function player(placeId: PlaceEnum, progression: number) {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, placeId, canRename: false });
	await prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'kabuki' } },
		create: { userId: user.id, scenarioKey: 'kabuki', progression, tracking: 0 },
		update: { progression, tracking: 0 }
	});
	return { user, dinoz };
}

async function phase(userId: string, dinozId: number, dialogId: string, links: string[], now?: Date) {
	let current = await startDialog({ userId, dinozId, dialogId, now });
	for (const linkId of links) {
		expect(
			current.links.map(link => link.id),
			`${dialogId}:${current.phaseId} should offer ${linkId}`
		).toContain(linkId);
		current = await selectDialogLink({ userId, dinozId, dialogId, phaseId: current.phaseId, linkId, now });
	}
	return current;
}

async function progression(userId: string, key = 'kabuki') {
	const result = await prisma.userScenario.findUnique({
		where: { scenarioKey_userId: { userId, scenarioKey: key } },
		select: { progression: true }
	});
	return result?.progression ?? 0;
}

async function ingredients(userId: string, ingredientId: Ingredient) {
	const found = await prisma.userIngredients.findUnique({
		where: { ingredientId_userId: { ingredientId, userId } },
		select: { quantity: true }
	});
	return found?.quantity ?? 0;
}

async function eggs(userId: string) {
	const found = await prisma.userItems.findUnique({
		where: { itemId_userId: { userId, itemId: Item.KABUKI_EGG } },
		select: { quantity: true }
	});
	return found?.quantity ?? 0;
}

async function setGold(userId: string, amount: number) {
	await prisma.userWallet.update({
		where: { userId_type: { userId, type: 'GOLD' } },
		data: { amount }
	});
}

async function gold(userId: string) {
	return (
		await prisma.userWallet.findUniqueOrThrow({
			where: { userId_type: { userId, type: 'GOLD' } }
		})
	).amount;
}

function findUserHour(userId: string, chance: number, eligible: boolean): Date {
	const epoch = Date.parse('2026-11-12T00:00:00.000Z');
	for (let offset = 0; offset < 2000; offset++) {
		const now = new Date(epoch + offset * 60 * 60 * 1000);
		if (evalTimedRandomCondition(now, chance, userId) === eligible) return now;
	}
	throw new Error(`Could not find a user-specific utime(${chance}) window`);
}

const ingredientChain = [
	{ ingredient: Ingredient.MEROU_LUJIDANE, count: 5, link: 'i1' },
	{ ingredient: Ingredient.FEUILLES_DE_PELINAE, count: 5, link: 'i2' },
	{ ingredient: Ingredient.TOUFFE_DE_FOURRURE, count: 5, link: 'i3' },
	{ ingredient: Ingredient.SILEX_TAILLE, count: 2, link: 'i4' },
	{ ingredient: Ingredient.ENERGIE_AIR, count: 1, link: 'i5' },
	{ ingredient: Ingredient.ENERGIE_EAU, count: 1, link: 'i6' }
] as const;

describe('Kabuki: Igor ingredient chain and Totem egg shop (integration)', () => {
	it('shows Yakuzi at the Port de Prêche during a valid user-specific time window', async () => {
		const { user, dinoz } = await player(PlaceEnum.PORT_DE_PRECHE, 0);
		const hiddenAt = findUserHour(user.id, 6, false);
		const visibleAt = findUserHour(user.id, 6, true);
		const hidden = await listAvailableDialogs({ userId: user.id, dinozId: dinoz.id, now: hiddenAt });
		const visible = await listAvailableDialogs({ userId: user.id, dinozId: dinoz.id, now: visibleAt });
		expect(hidden.map(dialog => dialog.id)).not.toContain('yakuzi_port_intro');
		expect(visible.map(dialog => dialog.id)).toContain('yakuzi_port_intro');
	});
	it('completes Igor introduction, then unlocks the decoded parchment only after 35 hours', async () => {
		const { user, dinoz } = await player(PlaceEnum.UNIVERSITE, 5);
		await phase(user.id, dinoz.id, 'igor_kabuki_intro', [
			'speak',
			'legend',
			'cata',
			'next',
			'kabuki',
			'oh',
			'yes',
			'show'
		]);
		expect(await progression(user.id)).toBe(10);
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'igor_kabuki_decoded' })
		).rejects.toMatchObject({ code: 'dialogNotAvailable' });
		await prisma.userScenario.update({
			where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'kabuki' } },
			data: { updatedAt: new Date(Date.now() - 36 * 60 * 60 * 1000) }
		});
		await phase(user.id, dinoz.id, 'igor_kabuki_decoded', ['next', 'aura', 'how', 'ingr', 'ingr2', 'ok']);
		expect(await progression(user.id)).toBe(11);
	});

	it('consumes all six ingredients in MT order and persists each phase 11 to 17', async () => {
		const { user, dinoz } = await player(PlaceEnum.UNIVERSITE, 11);
		for (let i = 0; i < ingredientChain.length; i++) {
			const current = ingredientChain[i];
			await prisma.userIngredients.create({
				data: { userId: user.id, ingredientId: current.ingredient, quantity: current.count + 2 }
			});
			const opened = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'igor_kabuki_ingredients' });
			expect(opened.links.map(link => link.id)).toContain(current.link);
			const submitted = await selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'igor_kabuki_ingredients',
				phaseId: 'begin',
				linkId: current.link
			});
			expect(submitted.phaseId).toBe(current.link);
			expect(await progression(user.id)).toBe(12 + i);
			expect(await ingredients(user.id, current.ingredient)).toBe(2);
		}
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'igor_kabuki_ingredients' })
		).rejects.toMatchObject({ code: 'dialogNotAvailable' });
	});

	it('does not consume partial ingredients or advance Igor when the player lacks one', async () => {
		const { user, dinoz } = await player(PlaceEnum.UNIVERSITE, 11);
		await prisma.userIngredients.create({
			data: { userId: user.id, ingredientId: Ingredient.MEROU_LUJIDANE, quantity: 4 }
		});
		await expect(phase(user.id, dinoz.id, 'igor_kabuki_ingredients', ['i1'])).rejects.toThrow();
		expect(await progression(user.id)).toBe(11);
		expect(await ingredients(user.id, Ingredient.MEROU_LUJIDANE)).toBe(4);
	});

	it('requires Igor 70-hour wait after ingredients before revealing the Coral Mines betrayal', async () => {
		const { user, dinoz } = await player(PlaceEnum.UNIVERSITE, 17);
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'igor_kabuki_aura' })
		).rejects.toMatchObject({ code: 'dialogNotAvailable' });
		await prisma.userScenario.update({
			where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'kabuki' } },
			data: { updatedAt: new Date(Date.now() - 71 * 60 * 60 * 1000) }
		});
		await phase(user.id, dinoz.id, 'igor_kabuki_aura', ['aura', 'ok']);
		expect(await progression(user.id)).toBe(18);
	});

	it('blocks an egg purchase outside its utime window and preserves gold', async () => {
		const { user, dinoz } = await player(PlaceEnum.ITOTEM, 23);
		await setGold(user.id, 80_000);
		const now = findUserHour(user.id, 100, false);
		const opened = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'yakuzi_totem_eggs', now });
		expect(opened.links.map(link => link.id)).toContain('noegg');
		expect(opened.links.map(link => link.id)).not.toContain('egg');
		expect(await gold(user.id)).toBe(80_000);
		expect(await eggs(user.id)).toBe(0);
	});

	it('purchases a Kabuki egg for 50,000 gold during an eligible utime window', async () => {
		const { user, dinoz } = await player(PlaceEnum.ITOTEM, 23);
		const now = findUserHour(user.id, 100, true);
		await setGold(user.id, 80_000);
		const bought = await phase(user.id, dinoz.id, 'yakuzi_totem_eggs', ['egg', 'buy'], now);
		expect(bought.phaseId).toBe('buy');
		expect(await gold(user.id)).toBe(30_000);
		expect(await eggs(user.id)).toBe(1);
		expect(await progression(user.id)).toBe(22);
		expect(await progression(user.id, 'kabegg')).toBe(1);
	});

	it('rejects insufficient funds atomically without granting an egg', async () => {
		const { user, dinoz } = await player(PlaceEnum.ITOTEM, 23);
		const now = findUserHour(user.id, 100, true);
		await setGold(user.id, 49_999);
		await expect(phase(user.id, dinoz.id, 'yakuzi_totem_eggs', ['egg', 'buy'], now)).rejects.toThrow();
		expect(await gold(user.id)).toBe(49_999);
		expect(await eggs(user.id)).toBe(0);
		expect(await progression(user.id)).toBe(23);
		expect(await progression(user.id, 'kabegg')).toBe(0);
	});

	it('blocks further purchases after two purchased eggs even if gold is available', async () => {
		const { user, dinoz } = await player(PlaceEnum.ITOTEM, 23);
		const now = findUserHour(user.id, 100, true);
		await setGold(user.id, 200_000);
		await prisma.userScenario.create({
			data: { userId: user.id, scenarioKey: 'kabegg', progression: 2, tracking: 0 }
		});
		const opened = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'yakuzi_totem_eggs', now });
		expect(opened.links.map(link => link.id)).toContain('maxegg');
		expect(opened.links.map(link => link.id)).not.toContain('egg');
		expect(await gold(user.id)).toBe(200_000);
	});
});
