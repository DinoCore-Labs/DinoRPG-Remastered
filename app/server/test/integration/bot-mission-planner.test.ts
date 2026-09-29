import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getBotMissionIntent } from '../../src/Bot/Service/botMission.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot mission planner', () => {
	it('understands the successive goals of the fish mission', async () => {
		const user = await createTestUser({
			name: 'FishMissionBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});

		const mission = await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'fish',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		await expect(getBotMissionIntent(dinoz.id)).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.PORT_DE_PRECHE
		});

		await prisma.dinoz.update({
			where: { id: dinoz.id },
			data: { placeId: PlaceEnum.PORT_DE_PRECHE }
		});
		await prisma.dinozMissions.update({
			where: { id: mission.id },
			data: { progression: 1 }
		});

		await expect(getBotMissionIntent(dinoz.id)).resolves.toEqual({
			type: 'interact'
		});

		await prisma.dinozMissions.update({
			where: { id: mission.id },
			data: { progression: 2 }
		});

		await expect(getBotMissionIntent(dinoz.id)).resolves.toEqual({
			type: 'move',
			placeId: PlaceEnum.DINOVILLE
		});

		await prisma.dinoz.update({
			where: { id: dinoz.id },
			data: { placeId: PlaceEnum.PAPY_JOE }
		});
		await prisma.dinozMissions.update({
			where: { id: mission.id },
			data: { progression: 4 }
		});

		await expect(getBotMissionIntent(dinoz.id)).resolves.toEqual({
			type: 'interact'
		});
	});
});
