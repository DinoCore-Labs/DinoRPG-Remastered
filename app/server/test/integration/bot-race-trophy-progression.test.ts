import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotProgressionGoal } from '../../../prisma/index.js';
import { getOrAssignBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { getBotRaceTrophyProgressionStep } from '../../src/Bot/Service/botRaceTrophyProgression.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function createBotDinoz(level: number, placeId = PlaceEnum.DINOVILLE) {
	const user = await createTestUser({
		withTutorial: false
	});
	await prisma.user.update({
		where: { id: user.id },
		data: { isBot: true }
	});
	const dinoz = await createTestDinoz({
		userId: user.id,
		level,
		placeId,
		canRename: false
	});
	return { user, dinoz };
}

async function addReward(userId: string, rewardId: Reward) {
	await prisma.userRewards.create({
		data: {
			userId,
			rewardId
		}
	});
}

describe('bot race trophy progression', () => {
	it('does not target race trophies before level 8', async () => {
		const { user, dinoz } = await createBotDinoz(7);

		await expect(
			getBotRaceTrophyProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});

	it('targets Hippoclamp first at level 8', async () => {
		const { user, dinoz } = await createBotDinoz(8);

		await expect(
			getBotRaceTrophyProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.ILE_WAIKIKI
		});

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz.id)
		).resolves.toBe(BotProgressionGoal.HIPPOCLAMP_TROPHY);
	});

	it('targets Pteroz after obtaining the Hippoclamp trophy', async () => {
		const { user, dinoz } = await createBotDinoz(8);
		await addReward(user.id, Reward.HIPPO);

		await expect(
			getBotRaceTrophyProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.PENTES_DE_BASALTE
		});

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz.id)
		).resolves.toBe(BotProgressionGoal.PTEROZ_TROPHY);
	});

	it('targets Rocky at level 13 after the first two trophies', async () => {
		const { user, dinoz } = await createBotDinoz(13, PlaceEnum.FORCEBRUT);
		await addReward(user.id, Reward.HIPPO);
		await addReward(user.id, Reward.PTEROZ);

		await expect(
			getBotRaceTrophyProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'dialog',
			dialogId: 'strange_rocky',
			preferredLinkIds: ['fight']
		});

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz.id)
		).resolves.toBe(BotProgressionGoal.ROCKY_TROPHY);
	});

	it('moves on from Rocky once all three shop trophies are owned', async () => {
		const { user, dinoz } = await createBotDinoz(13);
		await addReward(user.id, Reward.HIPPO);
		await addReward(user.id, Reward.PTEROZ);
		await addReward(user.id, Reward.ROCKY);

		const step = await getBotRaceTrophyProgressionStep(user.id, dinoz.id);
		expect(step).toBeNull();

		const goal = await getOrAssignBotProgressionGoal(user.id, dinoz.id);
		expect(goal).not.toBe(BotProgressionGoal.HIPPOCLAMP_TROPHY);
		expect(goal).not.toBe(BotProgressionGoal.PTEROZ_TROPHY);
		expect(goal).not.toBe(BotProgressionGoal.ROCKY_TROPHY);
	});
	it('preempts an older long-term goal when a trophy becomes available', async () => {
		const { user, dinoz } = await createBotDinoz(8);

		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz.id,
				goal: BotProgressionGoal.SHAMAN_STRATEGY
			}
		});

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz.id)
		).resolves.toBe(BotProgressionGoal.HIPPOCLAMP_TROPHY);
	});

	it('does not send a follower alone to unlock a trophy', async () => {
		const { user, dinoz: leader } = await createBotDinoz(8);
		const follower = await createTestDinoz({
			userId: user.id,
			level: 8,
			placeId: PlaceEnum.DINOVILLE,
			canRename: false
		});
		await prisma.dinoz.update({
			where: { id: follower.id },
			data: { leaderId: leader.id }
		});

		await expect(
			getBotRaceTrophyProgressionStep(user.id, follower.id)
		).resolves.toBeNull();
	});

});
