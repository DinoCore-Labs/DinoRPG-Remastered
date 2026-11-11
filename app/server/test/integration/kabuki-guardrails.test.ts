import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { prisma } from '../../src/prisma.js';
import { processKabukiScenarioMoveFight } from '../../src/Scenario/Controller/kabukiScenario.controller.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

const REWARD_DIALOG = 'yakuzi_totem_reward';
const REWARD_PATH = ['know', 'start', 'herit', 'parch', 'totem', 'why', 'ok', 'see', 'nice', 'see2', 'end'] as const;

beforeAll(() => loadDialogs());
beforeEach(async () => cleanDatabase());

async function setup(progression: number, placeId: PlaceEnum = PlaceEnum.ITOTEM) {
	const user = await createTestUser({ withTutorial: false });
	const dinoz = await createTestDinoz({ userId: user.id, placeId, canRename: false });
	await prisma.userScenario.create({
		data: { userId: user.id, scenarioKey: 'kabuki', progression, tracking: 0 }
	});
	return { user, dinoz };
}

async function progress(userId: string) {
	const row = await prisma.userScenario.findUniqueOrThrow({
		where: { scenarioKey_userId: { userId, scenarioKey: 'kabuki' } }
	});
	return row.progression;
}

async function eggCount(userId: string) {
	const row = await prisma.userItems.findUnique({
		where: { itemId_userId: { userId, itemId: Item.KABUKI_EGG } }
	});
	return row?.quantity ?? 0;
}

async function reachRewardChoice(userId: string, dinozId: number) {
	let phase = await startDialog({ userId, dinozId, dialogId: REWARD_DIALOG });
	for (const linkId of REWARD_PATH) {
		expect(phase.links.map(link => link.id)).toContain(linkId);
		phase = await selectDialogLink({
			userId,
			dinozId,
			dialogId: REWARD_DIALOG,
			phaseId: phase.phaseId,
			linkId
		});
	}
	expect(phase.phaseId).toBe('end');
	return phase;
}

describe('Kabuki guardrails: interruptions, stale links and duplicate rewards', () => {
	it('does not grant an egg when the player closes and reopens the reward dialogue before choosing', async () => {
		const { user, dinoz } = await setup(21);
		await prisma.userRewards.create({ data: { userId: user.id, rewardId: Reward.KAURA } });
		await reachRewardChoice(user.id, dinoz.id);
		expect(await eggCount(user.id)).toBe(0);
		expect(await progress(user.id)).toBe(21);

		// A fresh start represents closing the UI and reopening the NPC later.
		const reopened = await startDialog({ userId: user.id, dinozId: dinoz.id, dialogId: REWARD_DIALOG });
		expect(reopened.phaseId).toBe('begin');
		expect(await eggCount(user.id)).toBe(0);
		expect(await progress(user.id)).toBe(21);
	});

	it('rejects a link not offered at the current dialogue phase without advancing', async () => {
		const { user, dinoz } = await setup(21);
		await expect(
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: REWARD_DIALOG,
				phaseId: 'begin',
				linkId: 'yes'
			})
		).rejects.toThrow();
		expect(await eggCount(user.id)).toBe(0);
		expect(await progress(user.id)).toBe(21);
	});

	it('rejects a stale acceptance request once the first egg was claimed', async () => {
		const { user, dinoz } = await setup(21);
		await reachRewardChoice(user.id, dinoz.id);
		const chooseYes = () =>
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: REWARD_DIALOG,
				phaseId: 'end',
				linkId: 'yes'
			});
		await chooseYes();
		await expect(chooseYes()).rejects.toThrow();
		expect(await eggCount(user.id)).toBe(1);
		expect(await progress(user.id)).toBe(22);
	});

	it('serializes simultaneous first-egg acceptance and never duplicates the reward', async () => {
		const { user, dinoz } = await setup(21);
		await reachRewardChoice(user.id, dinoz.id);
		const chooseYes = () =>
			selectDialogLink({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: REWARD_DIALOG,
				phaseId: 'end',
				linkId: 'yes'
			});
		const settled = await Promise.allSettled([chooseYes(), chooseYes()]);
		expect(settled.filter(result => result.status === 'fulfilled')).toHaveLength(1);
		expect(settled.filter(result => result.status === 'rejected')).toHaveLength(1);
		expect(await eggCount(user.id)).toBe(1);
		expect(await progress(user.id)).toBe(22);
	});

	it('does not trigger Totem victory or grant the Aura at an invalid scenario phase', async () => {
		const { user, dinoz } = await setup(19, PlaceEnum.MINES_DE_CORAIL);
		const input = {
			user: { id: user.id, cooker: false, teacher: false, items: [] },
			team: [],
			dinozId: dinoz.id,
			fromPlace: PlaceEnum.MINES_DE_CORAIL,
			triggerPlace: PlaceEnum.ITOTEM,
			toPlace: PlaceEnum.ITOTEM
		};
		expect(await processKabukiScenarioMoveFight(input)).toBe(false);
		expect(await progress(user.id)).toBe(19);
		expect(await prisma.userRewards.count({ where: { userId: user.id, rewardId: Reward.KAURA } })).toBe(0);
		// Reaching phase 21 later must not replay the final encounter either.
		await prisma.userScenario.update({
			where: { scenarioKey_userId: { userId: user.id, scenarioKey: 'kabuki' } },
			data: { progression: 21 }
		});
		expect(await processKabukiScenarioMoveFight(input)).toBe(false);
		expect(await progress(user.id)).toBe(21);
	});
});
