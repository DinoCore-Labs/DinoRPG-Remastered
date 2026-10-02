import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { findBotMissionNextHop } from '../../src/Bot/Service/botPathfinding.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot pathfinding', () => {
	it('does not route through a locked movement condition', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FLEUVE_JUMIN,
			canRename: false
		});

		await expect(
			findBotMissionNextHop(
				user.id,
				dinoz.id,
				PlaceEnum.FLEUVE_JUMIN,
				PlaceEnum.CAMP_KORGON
			)
		).resolves.toBeNull();

		await prisma.dinozStatus.create({
			data: {
				dinozId: dinoz.id,
				statusId: DinozStatusId.FLIPPERS
			}
		});

		await expect(
			findBotMissionNextHop(
				user.id,
				dinoz.id,
				PlaceEnum.FLEUVE_JUMIN,
				PlaceEnum.CAMP_KORGON
			)
		).resolves.toBe(PlaceEnum.CAMP_KORGON);
	});

	it('routes through goto transitions while returning the executable first hop', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PORT_DE_PRECHE,
			canRename: false
		});
		await prisma.dinozStatus.create({
			data: {
				dinozId: dinoz.id,
				statusId: DinozStatusId.BUOY
			}
		});

		await expect(
			findBotMissionNextHop(
				user.id,
				dinoz.id,
				PlaceEnum.PORT_DE_PRECHE,
				PlaceEnum.ILE_WAIKIKI
			)
		).resolves.toBe(PlaceEnum.GO_TO_ATLANTEINES_ISLAND);
	});
});
