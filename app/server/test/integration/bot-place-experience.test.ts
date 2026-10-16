import { beforeEach, describe, expect, it } from 'vitest';

import {
	recordBotFightExperience,
	recordBotGatherExperience,
	recordBotPlaceVisit
} from '../../src/Bot/Service/botPlaceExperience.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot place experience', () => {
	it('accumulates visits for each Dinoz and place', async () => {
		const user = await createTestUser({
			name: 'PlaceMemoryBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: 7,
			canRename: false
		});

		await recordBotPlaceVisit(dinoz.id);
		await recordBotPlaceVisit(dinoz.id);

		const memory = await prisma.botDinozPlaceMemory.findUniqueOrThrow({
			where: {
				dinozId_placeId: {
					dinozId: dinoz.id,
					placeId: 7
				}
			}
		});
		expect(memory.visits).toBe(2);
		expect(memory.lastVisitedAt).not.toBeNull();
	});

	it('learns gather value from rewards found at a place', async () => {
		const user = await createTestUser({
			name: 'GatherMemoryBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: 12,
			canRename: false
		});

		await recordBotGatherExperience(dinoz.id, {
			grid: [],
			rewards: {
				gold: 250,
				item: [{ id: 1, price: 400, quantity: 2, maxQuantity: 10 }],
				ingredients: [{ ingredientId: 1, name: 'test', price: 50, maxQuantity: 10, quantity: 3 }]
			},
			isGridComplete: false,
			gridCompletionGoldReward: 0,
			ingredientsAtMaxQuantity: []
		});

		const memory = await prisma.botDinozPlaceMemory.findUniqueOrThrow({
			where: {
				dinozId_placeId: {
					dinozId: dinoz.id,
					placeId: 12
				}
			}
		});
		expect(memory.gatherAttempts).toBe(1);
		expect(memory.gatherSuccesses).toBe(1);
		expect(memory.gatherValue).toBe(1200);
	});

	it('remembers combat success and damage taken in a zone', async () => {
		const user = await createTestUser({
			name: 'FightMemoryBot',
			withTutorial: false
		});
		await prisma.user.update({
			where: { id: user.id },
			data: { isBot: true }
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false
		});

		await recordBotFightExperience(dinoz.id, 18, true, 12);
		await recordBotFightExperience(dinoz.id, 18, false, 45);

		const memory = await prisma.botDinozPlaceMemory.findUniqueOrThrow({
			where: {
				dinozId_placeId: {
					dinozId: dinoz.id,
					placeId: 18
				}
			}
		});
		expect(memory.fights).toBe(2);
		expect(memory.wins).toBe(1);
		expect(memory.losses).toBe(1);
		expect(memory.hpLost).toBe(57);
	});
});
