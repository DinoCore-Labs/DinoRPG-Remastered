import { beforeEach, describe, expect, it } from 'vitest';

import { BotStrategy } from '../../../prisma/index.js';
import { Action } from '@dinorpg/core/models/dinoz/dinozActions.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { executeBotDecision } from '../../src/Bot/Service/botAction.service.js';
import { chooseBotDecision } from '../../src/Bot/Service/botDecision.service.js';
import { createBotPlayer } from '../../src/Bot/Service/createBotPlayer.service.js';
import { getCurrentTutorial } from '../../src/Tutorial/Controller/tutorial.controller.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot tutorial', () => {
	it('speaks to Guide Michel before starting normal gameplay', async () => {
		const created = await createBotPlayer({
			name: 'TutorialBot',
			strategy: BotStrategy.BALANCED
		});

		const before = await getCurrentTutorial(created.user.id);
		expect(before?.objective?.id).toBe('speak');

		const decision = await chooseBotDecision(created.user.id, BotStrategy.BALANCED);
		expect(decision).toMatchObject({
			dinozId: created.dinoz.id,
			action: 'tutorial_dialog',
			dialogId: 'guide'
		});

		await executeBotDecision(created.user.id, BotStrategy.BALANCED, decision!);

		const after = await getCurrentTutorial(created.user.id);
		expect(after?.objective?.id).toBe('move');

		const intro = await prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					userId: created.user.id,
					scenarioKey: 'intro'
				}
			}
		});
		expect(intro?.progression).toBe(1);

		const moveDecision = await chooseBotDecision(created.user.id, BotStrategy.BALANCED);
		expect(moveDecision).toMatchObject({
			dinozId: created.dinoz.id,
			action: 'move'
		});
	});
	it('restores an action instead of idling between tutorial moves', async () => {
		const created = await createBotPlayer({
			name: 'TutorialRecoveryBot',
			strategy: BotStrategy.BALANCED
		});

		const speakDecision = await chooseBotDecision(created.user.id, BotStrategy.BALANCED);
		await executeBotDecision(created.user.id, BotStrategy.BALANCED, speakDecision!);

		const firstMove = await chooseBotDecision(created.user.id, BotStrategy.BALANCED);
		expect(firstMove).toMatchObject({
			action: 'move',
			targetPlaceId: PlaceEnum.FOUTAINE_DE_JOUVENCE
		});
		await executeBotDecision(created.user.id, BotStrategy.BALANCED, firstMove!);

		await prisma.dinoz.update({
			where: { id: created.dinoz.id },
			data: {
				fight: false,
				remaining: 0
			}
		});

		const recovery = await chooseBotDecision(created.user.id, BotStrategy.BALANCED);
		expect(recovery).toMatchObject({
			dinozId: created.dinoz.id,
			action: Action.IRMA
		});
	});

});
