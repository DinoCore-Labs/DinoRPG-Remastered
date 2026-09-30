import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotProgressionGoal } from '../../../prisma/index.js';
import { getBotKorgonProgressionStep } from '../../src/Bot/Service/botKorgonProgression.service.js';
import { getOrAssignBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
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

async function createBotWithDinoz(name: string, placeId: PlaceEnum = PlaceEnum.CAMP_KORGON) {
	const user = await createTestUser({
		name,
		withTutorial: false
	});
	await prisma.user.update({
		where: { id: user.id },
		data: { isBot: true }
	});
	const dinoz = await createTestDinoz({
		userId: user.id,
		placeId,
		canRename: false
	});
	return { user, dinoz };
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot Korgon flippers progression', () => {
	it('builds Dian trust before opening the mission list', async () => {
		const { user, dinoz } = await createBotWithDinoz('KorgonDialogBot');

		await expect(getBotKorgonProgressionStep(user.id, dinoz.id)).resolves.toEqual({
			type: 'dialog',
			dialogId: 'dian_korgsey',
			preferredLinkIds: [
				'korgons',
				'why',
				'wood',
				'tame',
				'interest',
				'service',
				'missions'
			]
		});
	});

	it('returns control to the mission engine while kswim is active', async () => {
		const { user, dinoz } = await createBotWithDinoz('KorgonMissionBot');
		await addStatus(dinoz.id, DinozStatusId.DIAN);
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'kswim',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		await expect(getBotKorgonProgressionStep(user.id, dinoz.id)).resolves.toBeNull();
	});

	it('finishes the Korgon chapter once flippers are obtained', async () => {
		const { user, dinoz } = await createBotWithDinoz('KorgonDoneBot');
		for (const statusId of [
			DinozStatusId.STRATEGY_IN_130_LESSONS,
			DinozStatusId.TOURNA,
			DinozStatusId.LANTERN,
			DinozStatusId.FLIPPERS
		]) {
			await addStatus(dinoz.id, statusId);
		}

		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz.id,
				goal: BotProgressionGoal.KORGON_FLIPPERS
			}
		});

		await expect(getBotKorgonProgressionStep(user.id, dinoz.id)).resolves.toBeNull();
		await expect(getOrAssignBotProgressionGoal(user.id, dinoz.id)).resolves.toBeNull();
		expect(
			await prisma.botDinozMemory.count({
				where: { dinozId: dinoz.id }
			})
		).toBe(0);
	});
});
