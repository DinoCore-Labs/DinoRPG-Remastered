import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotProgressionGoal } from '../../../prisma/index.js';
import { getOrAssignBotProgressionGoal } from '../../src/Bot/Service/botProgressionMemory.service.js';
import { getBotSteppesProgressionStep } from '../../src/Bot/Service/botSteppesProgression.service.js';
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

async function createBotDinoz(name: string, placeId: PlaceEnum) {
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

describe('bot Steppes progression', () => {
	it('does not target the Steppes without the Sylvenoire key', async () => {
		const { user, dinoz } = await createBotDinoz(
			'SteppesNoKeyBot',
			PlaceEnum.PORTE_DE_SYLVENOIRE
		);

		await expect(
			getBotSteppesProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});

	it('heads to the Sylvenoire gate after obtaining the key', async () => {
		const { user, dinoz } = await createBotDinoz(
			'SteppesGateBot',
			PlaceEnum.JUNGLE_SAUVAGE
		);
		await addStatus(dinoz.id, DinozStatusId.SYLVENOIRE_KEY);

		await expect(
			getBotSteppesProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.PORTE_DE_SYLVENOIRE
		});
	});

	it('uses the Steppes transition from the Sylvenoire gate', async () => {
		const { user, dinoz } = await createBotDinoz(
			'SteppesTransitionBot',
			PlaceEnum.PORTE_DE_SYLVENOIRE
		);
		await addStatus(dinoz.id, DinozStatusId.SYLVENOIRE_KEY);

		await expect(
			getBotSteppesProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.GO_TO_STEPPES
		});
	});

	it('finishes the Steppes access goal once inside the Steppe zone', async () => {
		const { user, dinoz } = await createBotDinoz(
			'SteppesDoneBot',
			PlaceEnum.FRONTIERE_CREPITANTE
		);
		for (const statusId of [
			DinozStatusId.STRATEGY_IN_130_LESSONS,
			DinozStatusId.TOURNA,
			DinozStatusId.LANTERN,
			DinozStatusId.FLIPPERS,
			DinozStatusId.SYLVENOIRE_KEY
		]) {
			await addStatus(dinoz.id, statusId);
		}

		await prisma.botDinozMemory.create({
			data: {
				dinozId: dinoz.id,
				goal: BotProgressionGoal.STEPPES_ACCESS
			}
		});

		await expect(
			getBotSteppesProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
		await expect(
			getOrAssignBotProgressionGoal(user.id, dinoz.id)
		).resolves.toBeNull();

		expect(
			await prisma.botDinozMemory.count({
				where: { dinozId: dinoz.id }
			})
		).toBe(0);
	});
});
