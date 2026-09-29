import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { shouldBotDigOldStone } from '../../src/Bot/Service/botProgressionOpportunity.service.js';
import { getBotShamanProgressionStep } from '../../src/Bot/Service/botShamanProgression.service.js';
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

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot Shaman Mou progression', () => {
	it('opens the Shaman mission chain when shflag is missing', async () => {
		const user = await createTestUser({
			name: 'ShamanBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FOSSELAVE,
			canRename: false
		});

		const step = await getBotShamanProgressionStep(user.id, dinoz.id);

		expect(step).toEqual({
			type: 'dialog',
			dialogId: 'shaman_mou',
			preferredLinkIds: ['souvenir', 'more', 'accept', 'missions']
		});
	});

	it('returns control to the mission engine while init1 is active', async () => {
		const user = await createTestUser({
			name: 'ShamanMissionBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FOSSELAVE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.SHFLAG);
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'init1',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		await expect(getBotShamanProgressionStep(user.id, dinoz.id)).resolves.toBeNull();
	});

	it('stops prioritizing Shaman Mou once strategy in 130 lessons is obtained', async () => {
		const user = await createTestUser({
			name: 'ShamanDoneBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FOSSELAVE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.STRATEGY_IN_130_LESSONS);

		await expect(getBotShamanProgressionStep(user.id, dinoz.id)).resolves.toBeNull();
	});
});

describe('bot Ashpouk progression opportunities', () => {
	it('digs the old stone when visiting Ashpouk with a shovel', async () => {
		const user = await createTestUser({
			name: 'OldStoneBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.RUINES_ASHPOUK,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.SHOVEL);

		await expect(shouldBotDigOldStone(user.id, dinoz.id)).resolves.toBe(true);
	});

	it('does not dig again after obtaining the old stone', async () => {
		const user = await createTestUser({
			name: 'OldStoneDoneBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.RUINES_ASHPOUK,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.SHOVEL);
		await addStatus(dinoz.id, DinozStatusId.OLD_STONE);

		await expect(shouldBotDigOldStone(user.id, dinoz.id)).resolves.toBe(false);
	});
});
