import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BotDinozRole, BotStrategy } from '../../../prisma/index.js';
import { executeBotDialog, getBotMissionWeight } from '../../src/Bot/Service/botDialog.service.js';
import { loadDialogs } from '../../src/Dialog/Controller/dialog.registry.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
	loadDialogs();
	vi.restoreAllMocks();
});

describe('bot dialog missions', () => {
	it('starts one of the missions offered by Papy Joe', async () => {
		const user = await createTestUser({
			name: 'MissionDialogBot',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});

		vi.spyOn(Math, 'random').mockReturnValue(0);

		await executeBotDialog(user.id, dinoz.id, 'papy_joe');

		const activeMission = await prisma.dinozMissions.findFirst({
			where: {
				dinozId: dinoz.id,
				isCompleted: false
			}
		});

		expect(activeMission).not.toBeNull();
		expect(['fish', 'dog']).toContain(activeMission?.missionKey);
	});

	it('weights combat missions higher for fighter Dinoz', () => {
		expect(getBotMissionWeight('kilgou', BotStrategy.BALANCED, BotDinozRole.FIGHTER)).toBeGreaterThan(
			getBotMissionWeight('fflow', BotStrategy.BALANCED, BotDinozRole.FIGHTER)
		);
	});

	it('weights action missions higher for gatherer Dinoz', () => {
		expect(getBotMissionWeight('fflow', BotStrategy.BALANCED, BotDinozRole.GATHERER)).toBeGreaterThan(
			getBotMissionWeight('kilgou', BotStrategy.BALANCED, BotDinozRole.GATHERER)
		);
	});

	it('weights travel and dialog missions higher for explorer Dinoz', () => {
		expect(getBotMissionWeight('fish', BotStrategy.BALANCED, BotDinozRole.EXPLORER)).toBeGreaterThan(
			getBotMissionWeight('kilgou', BotStrategy.BALANCED, BotDinozRole.EXPLORER)
		);
	});

});
