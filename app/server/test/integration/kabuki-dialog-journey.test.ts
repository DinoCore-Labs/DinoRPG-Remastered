import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeAll(() => loadDialogs());
beforeEach(async () => cleanDatabase());

async function setKabuki(userId: string, progression: number) {
	await prisma.userScenario.upsert({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } },
		create: { userId, scenarioKey: 'kabuki', progression, tracking: 0 },
		update: { progression, tracking: 0 }
	});
}

async function progressionOf(userId: string, scenarioKey = 'kabuki') {
	return (
		(
			await prisma.userScenario.findUnique({
				where: { scenarioKey_userId: { userId, scenarioKey } },
				select: { progression: true }
			})
		)?.progression ?? 0
	);
}

async function itemQuantity(userId: string, itemId: Item) {
	return (
		(
			await prisma.userItems.findUnique({
				where: { itemId_userId: { userId, itemId } },
				select: { quantity: true }
			})
		)?.quantity ?? 0
	);
}

async function playerAt(placeId: PlaceEnum, progression: number) {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, placeId, canRename: false });
	await setKabuki(user.id, progression);
	return { user, dinoz };
}

async function choose(userId: string, dinozId: number, dialogId: string, phaseId: string, linkId: string) {
	return selectDialogLink({ userId, dinozId, dialogId, phaseId, linkId });
}

async function follow(userId: string, dinozId: number, dialogId: string, links: string[]) {
	let phase = await startDialog({ userId, dinozId, dialogId });
	for (const linkId of links) {
		expect(
			phase.links.map(l => l.id),
			`${dialogId}:${phase.phaseId} must offer ${linkId}`
		).toContain(linkId);
		phase = await choose(userId, dinozId, dialogId, phase.phaseId, linkId);
	}
	return phase;
}

describe('Kabuki journey: persisted dialogue progression', () => {
	it.each([
		{ phase: 1, place: PlaceEnum.PORT_DE_PRECHE, dialog: 'yakuzi_port_debt' },
		{ phase: 3, place: PlaceEnum.FORGES_DU_GTC, dialog: 'yakuzi_forges' },
		{ phase: 4, place: PlaceEnum.GORGES_PROFONDES, dialog: 'yakuzi_gorges' },
		{ phase: 5, place: PlaceEnum.UNIVERSITE, dialog: 'igor_kabuki_intro' },
		{ phase: 18, place: PlaceEnum.MINES_DE_CORAIL, dialog: 'igor_kabuki_betrayal' }
	])(
		'opens $dialog at Kabuki phase $phase without prematurely advancing progress',
		async ({ phase, place, dialog }) => {
			const { user, dinoz } = await playerAt(place, phase);
			const opened = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: dialog });
			expect(opened.dialogId).toBe(dialog);
			expect(opened.phaseId).toBe('begin');
			expect(await progressionOf(user.id)).toBe(phase);
		}
	);

	it('charges the original 10,000 gold Yakuzi debt only on confirmation', async () => {
		const { user, dinoz } = await playerAt(PlaceEnum.PORT_DE_PRECHE, 1);
		await prisma.userWallet.update({
			where: { userId_type: { userId: user.id, type: 'GOLD' } },
			data: { amount: 20_000 }
		});
		const initialGold = 20_000;
		await follow(user.id, dinoz.id, 'yakuzi_port_debt', ['welcome']);
		expect(await progressionOf(user.id)).toBe(1);
		const currentBefore = await prisma.userWallet.findUniqueOrThrow({
			where: { userId_type: { userId: user.id, type: 'GOLD' } }
		});
		expect(currentBefore.amount).toBe(initialGold);
		await choose(user.id, dinoz.id, 'yakuzi_port_debt', 'welcome', 'yes');
		expect(await progressionOf(user.id)).toBe(2);
		const currentAfter = await prisma.userWallet.findUniqueOrThrow({
			where: { userId_type: { userId: user.id, type: 'GOLD' } }
		});
		expect(currentAfter.amount).toBe(initialGold - 10_000);
	});

	it('does not make the Totem reward available before Igor is defeated', async () => {
		const { user, dinoz } = await playerAt(PlaceEnum.ITOTEM, 20);
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'yakuzi_totem_reward' })
		).rejects.toMatchObject({ code: 'dialogNotAvailable' });
		expect(await itemQuantity(user.id, Item.KABUKI_EGG)).toBe(0);
	});

	it('refusing the first Totem egg leaves progression 21 and grants nothing', async () => {
		const { user, dinoz } = await playerAt(PlaceEnum.ITOTEM, 21);
		await prisma.userRewards.create({ data: { userId: user.id, rewardId: Reward.KAURA } });
		const phase = await follow(user.id, dinoz.id, 'yakuzi_totem_reward', [
			'know',
			'start',
			'herit',
			'parch',
			'totem',
			'why',
			'ok',
			'see',
			'nice',
			'see2',
			'end',
			'no'
		]);
		expect(phase.phaseId).toBe('no');
		expect(await progressionOf(user.id)).toBe(21);
		expect(await itemQuantity(user.id, Item.KABUKI_EGG)).toBe(0);
	});

	it('grants exactly one first Kabuki egg and switches the available Totem dialogue to phase 22', async () => {
		const { user, dinoz } = await playerAt(PlaceEnum.ITOTEM, 21);
		await prisma.userRewards.create({ data: { userId: user.id, rewardId: Reward.KAURA } });
		const phase = await follow(user.id, dinoz.id, 'yakuzi_totem_reward', [
			'know',
			'start',
			'herit',
			'parch',
			'totem',
			'why',
			'ok',
			'see',
			'nice',
			'see2',
			'end',
			'yes'
		]);
		expect(phase.phaseId).toBe('yes');
		expect(await progressionOf(user.id)).toBe(22);
		expect(await itemQuantity(user.id, Item.KABUKI_EGG)).toBe(1);
		await expect(
			startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'yakuzi_totem_reward' })
		).rejects.toMatchObject({ code: 'dialogNotAvailable' });
		const next = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: 'yakuzi_totem_wait' });
		expect(next.phaseId).toBe('begin');
		expect(await itemQuantity(user.id, Item.KABUKI_EGG)).toBe(1);
	});
});
