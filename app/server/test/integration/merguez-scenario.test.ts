import {
	MERGUEZ_SCENARIO_KEY,
	MERGUEZ_SCENARIO_STEPS,
	MERGUEZ_SCENARIO_THRESHOLDS
} from '@dinorpg/core/models/scenarios/data/merguezScenario.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import { advanceMerguezScenarioOnMerguezUsedTx } from '../../src/Scenario/Controller/merguezScenario.controller.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function createMerguezScenario(userId: string, progression: number, tracking = 0) {
	return prisma.userScenario.create({
		data: {
			userId,
			scenarioKey: MERGUEZ_SCENARIO_KEY,
			progression,
			tracking
		}
	});
}

async function getMerguezScenario(userId: string) {
	return prisma.userScenario.findUniqueOrThrow({
		where: {
			scenarioKey_userId: {
				scenarioKey: MERGUEZ_SCENARIO_KEY,
				userId
			}
		}
	});
}

describe('Merguez scenario', () => {
	it('does not start the scenario automatically', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 10
			})
		);
		expect(progressed).toBe(false);
		const scenario = await prisma.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					scenarioKey: MERGUEZ_SCENARIO_KEY,
					userId: user.id
				}
			}
		});
		expect(scenario).toBeNull();
	});

	it('tracks used merguez while the scenario is active', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 25
			})
		);
		expect(progressed).toBe(false);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.STARTED);
		expect(scenario.tracking).toBe(25);
	});

	it('reaches the first report after 100 used merguez', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED, 90);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 10
			})
		);
		expect(progressed).toBe(true);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.tracking).toBe(MERGUEZ_SCENARIO_THRESHOLDS.FIRST_REPORT_USED_COUNT);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.FIRST_REPORT);
	});

	it('crosses the first report threshold when several merguez are used at once', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED, 95);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 10
			})
		);
		expect(progressed).toBe(true);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.tracking).toBe(105);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.FIRST_REPORT);
	});

	it('reaches the final report after 500 used merguez', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.FIRST_REPORT_DONE, 490);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 10
			})
		);
		expect(progressed).toBe(true);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.tracking).toBe(MERGUEZ_SCENARIO_THRESHOLDS.FINAL_REPORT_USED_COUNT);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.FINAL_REPORT);
	});

	it('does not skip the first report interaction', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.FIRST_REPORT, 100);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 25
			})
		);
		expect(progressed).toBe(false);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.FIRST_REPORT);
		expect(scenario.tracking).toBe(125);
	});

	it('ignores merguez after the scenario is completed', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.COMPLETED, 500);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount: 20
			})
		);
		expect(progressed).toBe(false);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.COMPLETED);
		expect(scenario.tracking).toBe(500);
	});

	it.each([0, -1, -10, 1.5, Number.NaN])('ignores invalid usedCount %s', async usedCount => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED, 50);
		const progressed = await prisma.$transaction(tx =>
			advanceMerguezScenarioOnMerguezUsedTx(tx, {
				userId: user.id,
				usedCount
			})
		);
		expect(progressed).toBe(false);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.tracking).toBe(50);
	});

	it('does not lose concurrent merguez tracking', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED, 80);
		const results = await Promise.all([
			prisma.$transaction(tx =>
				advanceMerguezScenarioOnMerguezUsedTx(tx, {
					userId: user.id,
					usedCount: 15
				})
			),
			prisma.$transaction(tx =>
				advanceMerguezScenarioOnMerguezUsedTx(tx, {
					userId: user.id,
					usedCount: 15
				})
			)
		]);
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.tracking).toBe(110);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.FIRST_REPORT);
		expect(results.filter(Boolean)).toHaveLength(1);
	});

	it('rolls back tracking and progression together', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await createMerguezScenario(user.id, MERGUEZ_SCENARIO_STEPS.STARTED, 95);
		await expect(
			prisma.$transaction(async tx => {
				await advanceMerguezScenarioOnMerguezUsedTx(tx, {
					userId: user.id,
					usedCount: 10
				});
				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const scenario = await getMerguezScenario(user.id);
		expect(scenario.progression).toBe(MERGUEZ_SCENARIO_STEPS.STARTED);
		expect(scenario.tracking).toBe(95);
	});
});
