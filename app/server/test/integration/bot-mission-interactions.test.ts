import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';
import { executeBotMissionInteraction } from '../../src/Bot/Service/botMissionAction.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot mission interactions', () => {
	it('completes a modal TALK goal through the normal mission flow', async () => {
		const user = await createTestUser({
			name: 'MissionTalkBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PORT_DE_PRECHE,
			canRename: false
		});

		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'fish',
				progression: 1,
				tracking: 0,
				isCompleted: false
			}
		});

		await executeBotMissionInteraction(user.id, dinoz.id, BotStrategy.BALANCED);

		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});

		expect(mission.progression).toBe(2);
		expect(mission.tracking).toBe(0);
		expect(mission.isCompleted).toBe(false);
	});
});
