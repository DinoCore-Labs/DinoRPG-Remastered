import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotProgressionGoal, DinozConcentrationState } from '../../../prisma/index.js';
import { getOrAssignBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { getBotSylvenoireProgressionStep } from '../../src/Bot/Service/botSylvenoireProgression.service.js';
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

async function addCompletedProgressionStatuses(dinozId: number) {
	for (const statusId of [
		DinozStatusId.STRATEGY_IN_130_LESSONS,
		DinozStatusId.TOURNA,
		DinozStatusId.LANTERN,
		DinozStatusId.FLIPPERS
	]) {
		await addStatus(dinozId, statusId);
	}
}

async function createBotRoster(name: string, count: number, placeId = PlaceEnum.BAO_BOB) {
	const user = await createTestUser({
		name,
		withTutorial: false
	});
	await prisma.user.update({
		where: { id: user.id },
		data: { isBot: true }
	});

	const dinoz = [];
	for (let index = 0; index < count; index += 1) {
		const created = await createTestDinoz({
			userId: user.id,
			placeId,
			canRename: false
		});
		await addCompletedProgressionStatuses(created.id);
		dinoz.push(created);
	}

	return { user, dinoz };
}

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot Sylvenoire progression', () => {
	it('does not assign the Sylvenoire goal before seven eligible Dinoz exist', async () => {
		const { user, dinoz } = await createBotRoster('SylvenoireSmallRosterBot', 6);

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz[0].id)
		).resolves.toBe(BotProgressionGoal.STEPPES_ACCESS);
	});

	it('assigns Sylvenoire progression when seven flipper-equipped Dinoz are available', async () => {
		const { user, dinoz } = await createBotRoster('SylvenoireReadyBot', 7);

		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz[0].id)
		).resolves.toBe(BotProgressionGoal.SYLVENOIRE_KEY);

		await expect(
			getBotSylvenoireProgressionStep(user.id, dinoz[0].id)
		).resolves.toEqual({
			type: 'dialog',
			dialogId: 'bao_bob',
			preferredLinkIds: ['question', 'quest3', 'where', 'how', 'concen', 'ok']
		});
	});

	it('enters the dark portal after the seven-Dinoz concentration opens', async () => {
		const { user, dinoz } = await createBotRoster('SylvenoirePortalBot', 7);
		const session = await prisma.dinozConcentrationSession.create({
			data: {
				scopeKey: `user:${user.id}`,
				state: DinozConcentrationState.OPEN,
				openedAt: new Date()
			}
		});

		for (const member of dinoz) {
			await prisma.dinozConcentration.create({
				data: {
					dinozId: member.id,
					sessionId: session.id
				}
			});
		}

		await expect(
			getBotSylvenoireProgressionStep(user.id, dinoz[0].id)
		).resolves.toEqual({
			type: 'enter_portal'
		});
	});

	it('targets the dark tower entrance once inside the Dark World', async () => {
		const { user, dinoz } = await createBotRoster(
			'SylvenoireTowerBot',
			7,
			PlaceEnum.PORTAIL
		);

		await expect(
			getBotSylvenoireProgressionStep(user.id, dinoz[0].id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.TOUR_SOMBRE_ENTREE
		});
	});

	it('advances to Steppes access after obtaining the Sylvenoire key', async () => {
		const { user, dinoz } = await createBotRoster('SylvenoireDoneBot', 7);
		await addStatus(dinoz[0].id, DinozStatusId.SYLVENOIRE_KEY);

		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz[0].id,
				goal: BotProgressionGoal.SYLVENOIRE_KEY
			}
		});

		await expect(
			getBotSylvenoireProgressionStep(user.id, dinoz[0].id)
		).resolves.toBeNull();
		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz[0].id)
		).resolves.toBeNull();
	});
});
