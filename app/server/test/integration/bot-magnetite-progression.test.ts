import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import {
	MAGNETITE_SCENARIO_KEY,
	MagnetiteProgression
} from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getBotMagnetiteProgressionStep } from '../../src/Bot/Service/botMagnetiteProgression.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function setMagnetProgression(userId: string, progression: number) {
	await prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: MAGNETITE_SCENARIO_KEY
			}
		},
		create: {
			userId,
			scenarioKey: MAGNETITE_SCENARIO_KEY,
			progression
		},
		update: {
			progression
		}
	});
}

async function addStatus(dinozId: number, statusId: number) {
	await prisma.dinozStatus.create({
		data: {
			dinozId,
			statusId
		}
	});
}

describe('bot Magnetite progression', () => {
	it('starts the scenario by heading to the Whistling Syphon', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FRONTIERE_CREPITANTE,
			canRename: false
		});

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.SYPHON_SIFFLEUR
		});
	});

	it('accepts the King mission after the initial ambush', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CITADELLE_DU_ROI,
			canRename: false
		});
		await setMagnetProgression(user.id, MagnetiteProgression.TALK_TO_KING);

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toMatchObject({
			type: 'dialog',
			dialogId: 'rocky_king_magnet1'
		});
	});

	it('collects potion components in order without bypassing prerequisites', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CITADELLE_DU_ROI,
			canRename: false
		});
		await setMagnetProgression(user.id, MagnetiteProgression.PREPARE_POTION);

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.MINES_DE_CORAIL
		});

		await addStatus(dinoz.id, DinozStatusId.CORAIL);

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.GORGES_PROFONDES
		});

		await addStatus(dinoz.id, DinozStatusId.FSPELE);
		await prisma.dinoz.update({
			where: { id: dinoz.id },
			data: { placeId: PlaceEnum.GORGES_PROFONDES }
		});

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toMatchObject({
			type: 'dialog',
			dialogId: 'speleleologue_ice'
		});
	});

	it('stops planning once Magnetite is completed', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CONFINS_DES_STEPPES,
			canRename: false
		});
		await setMagnetProgression(user.id, MagnetiteProgression.COMPLETED);

		await expect(
			getBotMagnetiteProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});
});
