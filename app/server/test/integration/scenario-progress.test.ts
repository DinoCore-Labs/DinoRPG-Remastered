import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import {
	getUserScenarioProgression,
	incrementUserScenarioProgression,
	setUserScenarioProgression
} from '../../src/Scenario/Controller/scenarioProgress.controller.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('scenario progression', () => {
	it('returns the default state for an unknown scenario', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const scenario = await prisma.$transaction(tx => getUserScenarioProgression(tx, user.id, 'unknown'));
		expect(scenario).toEqual({
			progression: 0,
			tracking: 0,
			state: null
		});
		expect(await prisma.userScenario.count()).toBe(0);
	});

	it('creates a scenario progression', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.$transaction(tx =>
			setUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'star',
				progression: 2,
				tracking: 4,
				state: {
					step: 'megawolf'
				}
			})
		);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'star',
					userId: user.id
				}
			}
		});
		expect(scenario.progression).toBe(2);
		expect(scenario.tracking).toBe(4);
		expect(scenario.state).toEqual({
			step: 'megawolf'
		});
	});

	it('updates an existing scenario instead of creating a duplicate', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.$transaction(tx =>
			setUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'star',
				progression: 1,
				tracking: 2
			})
		);
		await prisma.$transaction(tx =>
			setUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'star',
				progression: 3,
				tracking: 5
			})
		);
		const scenarios = await prisma.userScenario.findMany({
			where: {
				userId: user.id,
				scenarioKey: 'star'
			}
		});
		expect(scenarios).toHaveLength(1);
		expect(scenarios[0]).toMatchObject({
			progression: 3,
			tracking: 5
		});
	});

	it('preserves tracking and state when they are not provided', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: 'test',
				progression: 2,
				tracking: 12,
				state: {
					flag: true
				}
			}
		});
		await prisma.$transaction(tx =>
			setUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'test',
				progression: 3
			})
		);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'test',
					userId: user.id
				}
			}
		});
		expect(scenario.progression).toBe(3);
		expect(scenario.tracking).toBe(12);
		expect(scenario.state).toEqual({
			flag: true
		});
	});

	it('creates a missing scenario when incrementing progression', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.$transaction(tx =>
			incrementUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'intro',
				delta: 2
			})
		);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'intro',
					userId: user.id
				}
			}
		});
		expect(scenario.progression).toBe(2);
		expect(scenario.tracking).toBe(0);
	});

	it('increments progression without changing tracking or state', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: 'intro',
				progression: 3,
				tracking: 8,
				state: {
					path: 'left'
				}
			}
		});
		await prisma.$transaction(tx =>
			incrementUserScenarioProgression(tx, {
				userId: user.id,
				scenarioKey: 'intro',
				delta: 2
			})
		);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'intro',
					userId: user.id
				}
			}
		});
		expect(scenario.progression).toBe(5);
		expect(scenario.tracking).toBe(8);
		expect(scenario.state).toEqual({
			path: 'left'
		});
	});

	it('does not lose concurrent progression increments', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await prisma.userScenario.create({
			data: {
				userId: user.id,
				scenarioKey: 'concurrent',
				progression: 0,
				tracking: 0
			}
		});
		await Promise.all([
			prisma.$transaction(tx =>
				incrementUserScenarioProgression(tx, {
					userId: user.id,
					scenarioKey: 'concurrent',
					delta: 1
				})
			),
			prisma.$transaction(tx =>
				incrementUserScenarioProgression(tx, {
					userId: user.id,
					scenarioKey: 'concurrent',
					delta: 1
				})
			)
		]);
		const scenario = await prisma.userScenario.findUniqueOrThrow({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'concurrent',
					userId: user.id
				}
			}
		});
		expect(scenario.progression).toBe(2);
	});

	it('rolls back scenario changes when the transaction fails', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await expect(
			prisma.$transaction(async tx => {
				await setUserScenarioProgression(tx, {
					userId: user.id,
					scenarioKey: 'rollback',
					progression: 5,
					tracking: 10
				});
				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const scenario = await prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					scenarioKey: 'rollback',
					userId: user.id
				}
			}
		});
		expect(scenario).toBeNull();
	});
});
