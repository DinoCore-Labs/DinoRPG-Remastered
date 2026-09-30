import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { getBotForestGuardianProgressionStep } from '../../src/Bot/Service/botForestGuardianProgression.service.js';
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

describe('bot forest guardian progression', () => {
	it('unlocks the forest guardian mission group at Sylvenoire gate', async () => {
		const user = await createTestUser({
			name: 'ForestGuardianBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.FLIPPERS);

		await expect(
			getBotForestGuardianProgressionStep(user.id, dinoz.id)
		).resolves.toEqual({
			type: 'dialog',
			dialogId: 'forest_guardian',
			preferredLinkIds: ['shake', 'item', 'missions']
		});
	});

	it('returns control to the mission engine while a forest guardian mission is active', async () => {
		const user = await createTestUser({
			name: 'ForestGuardianMissionBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.FLIPPERS);
		await addStatus(dinoz.id, DinozStatusId.GRDMIS);
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'unmute',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		await expect(
			getBotForestGuardianProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});

	it('stops the forest guardian chapter after flowering branch is obtained', async () => {
		const user = await createTestUser({
			name: 'ForestGuardianDoneBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PORTE_DE_SYLVENOIRE,
			canRename: false
		});
		await addStatus(dinoz.id, DinozStatusId.FLIPPERS);
		await addStatus(dinoz.id, DinozStatusId.FLOWERING_BRANCH);

		await expect(
			getBotForestGuardianProgressionStep(user.id, dinoz.id)
		).resolves.toBeNull();
	});
});
