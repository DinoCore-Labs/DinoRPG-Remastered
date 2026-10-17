import { beforeEach, describe, expect, it } from 'vitest';

import { BotDinozRole } from '../../../prisma/index.js';

import {
	getBotExplorationExperienceBonus,
	getBotFightExperienceBonus,
	getBotGatherExperienceBonus,
	getBotPreferredFightPlace,
	getBotPreferredGatherPlace,
	getBotRoleFightExperienceAdjustment,
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

	it('prefers unexplored destinations over repeatedly visited places', () => {
		const experience = new Map([
			[
				10,
				{
					placeId: 10,
					visits: 5,
					gatherAttempts: 0,
					gatherSuccesses: 0,
					gatherValue: 0,
					fights: 0,
					wins: 0,
					losses: 0,
					hpLost: 0,
					lastVisitedAt: new Date()
				}
			]
		]);

		expect(getBotExplorationExperienceBonus(experience, 11)).toBeGreaterThan(
			getBotExplorationExperienceBonus(experience, 10)
		);
	});

	it('rewards gather places that proved valuable', () => {
		const experience = new Map([
			[
				12,
				{
					placeId: 12,
					visits: 1,
					gatherAttempts: 4,
					gatherSuccesses: 4,
					gatherValue: 8000,
					fights: 0,
					wins: 0,
					losses: 0,
					hpLost: 0,
					lastVisitedAt: null
				}
			]
		]);

		expect(getBotGatherExperienceBonus(experience, 12)).toBeGreaterThan(0);
		expect(getBotGatherExperienceBonus(experience, 99)).toBe(0);
	});

	it('distinguishes safe winning combat zones from dangerous losing zones', () => {
		const safe = new Map([
			[
				20,
				{
					placeId: 20,
					visits: 1,
					gatherAttempts: 0,
					gatherSuccesses: 0,
					gatherValue: 0,
					fights: 4,
					wins: 4,
					losses: 0,
					hpLost: 40,
					lastVisitedAt: null
				}
			]
		]);
		const dangerous = new Map([
			[
				20,
				{
					placeId: 20,
					visits: 1,
					gatherAttempts: 0,
					gatherSuccesses: 0,
					gatherValue: 0,
					fights: 4,
					wins: 0,
					losses: 4,
					hpLost: 300,
					lastVisitedAt: null
				}
			]
		]);

		expect(getBotFightExperienceBonus(safe, 20, 100)).toBeGreaterThan(0);
		expect(getBotFightExperienceBonus(dangerous, 20, 100)).toBeLessThan(0);
	});


	it('selects the best proven gather place as a learned destination', () => {
		const experience = new Map([
			[
				30,
				{
					placeId: 30,
					visits: 2,
					gatherAttempts: 3,
					gatherSuccesses: 2,
					gatherValue: 1200,
					fights: 0,
					wins: 0,
					losses: 0,
					hpLost: 0,
					lastVisitedAt: null
				}
			],
			[
				31,
				{
					placeId: 31,
					visits: 2,
					gatherAttempts: 3,
					gatherSuccesses: 3,
					gatherValue: 9000,
					fights: 0,
					wins: 0,
					losses: 0,
					hpLost: 0,
					lastVisitedAt: null
				}
			]
		]);

		expect(getBotPreferredGatherPlace(experience)).toBe(31);
	});

	it('selects a proven safe fight place and ignores losing zones', () => {
		const experience = new Map([
			[
				40,
				{
					placeId: 40,
					visits: 2,
					gatherAttempts: 0,
					gatherSuccesses: 0,
					gatherValue: 0,
					fights: 4,
					wins: 4,
					losses: 0,
					hpLost: 30,
					lastVisitedAt: null
				}
			],
			[
				41,
				{
					placeId: 41,
					visits: 2,
					gatherAttempts: 0,
					gatherSuccesses: 0,
					gatherValue: 0,
					fights: 4,
					wins: 1,
					losses: 3,
					hpLost: 250,
					lastVisitedAt: null
				}
			]
		]);

		expect(getBotPreferredFightPlace(experience, 100)).toBe(40);
	});


	it('makes gatherers and explorers more reluctant to repeat dangerous free fights', () => {
		const dangerous = -60;

		expect(getBotRoleFightExperienceAdjustment(BotDinozRole.GATHERER, dangerous)).toBeLessThan(
			getBotRoleFightExperienceAdjustment(BotDinozRole.FIGHTER, dangerous)
		);
		expect(getBotRoleFightExperienceAdjustment(BotDinozRole.EXPLORER, dangerous)).toBeLessThan(
			getBotRoleFightExperienceAdjustment(BotDinozRole.FIGHTER, dangerous)
		);
	});

	it('lets fighters exploit safe combat zones more aggressively than other roles', () => {
		const safe = 60;

		expect(getBotRoleFightExperienceAdjustment(BotDinozRole.FIGHTER, safe)).toBeGreaterThan(
			getBotRoleFightExperienceAdjustment(BotDinozRole.EXPLORER, safe)
		);
		expect(getBotRoleFightExperienceAdjustment(BotDinozRole.EXPLORER, safe)).toBeGreaterThan(
			getBotRoleFightExperienceAdjustment(BotDinozRole.GATHERER, safe)
		);
	});

});
