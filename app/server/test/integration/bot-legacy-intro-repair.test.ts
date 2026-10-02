import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	getBotLegacyIntroRepairStep,
	repairLegacyTaurusReward
} from '../../src/Bot/Service/botLegacyIntroRepair.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot legacy intro repair', () => {
	it('restarts a missing legacy intro from the Port without touching tutorial rewards', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE,
			canRename: false
		});

		await expect(
			getBotLegacyIntroRepairStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.PORT_DE_PRECHE
		});

		const intro = await prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					userId: user.id,
					scenarioKey: 'intro'
				}
			}
		});
		expect(intro?.progression).toBe(1);
	});

	it('repairs Taurus once when legacy intro already reached phase 6', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE,
			canRename: false
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: 'intro',
				progression: 6
			}
		});

		await expect(
			getBotLegacyIntroRepairStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'repair_taurus'
		});

		await expect(repairLegacyTaurusReward(user.id)).resolves.toBe(true);
		await expect(repairLegacyTaurusReward(user.id)).resolves.toBe(false);

		expect(
			await prisma.userRewards.count({
				where: {
					userId: user.id,
					rewardId: Reward.TAURUS
				}
			})
		).toBe(1);

		await expect(
			getBotLegacyIntroRepairStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});
});
