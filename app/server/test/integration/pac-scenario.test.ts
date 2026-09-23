import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { PAC_SCENARIO_KEY, PAC_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/pacScenario.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import { discoverUserSkillsTx } from '../../src/Skill/Controller/discoveredUserSkills.controller.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function discoverSkills(userId: string, skillIds: number[]) {
	return prisma.$transaction(tx =>
		discoverUserSkillsTx(tx, {
			userId,
			skillIds
		})
	);
}

async function getPacRewardCount(userId: string) {
	return prisma.userRewards.count({
		where: {
			userId,
			rewardId: Reward.PAC
		}
	});
}

async function getPacStat(userId: string) {
	return prisma.userTracking.findUnique({
		where: {
			stat_userId: {
				userId,
				stat: StatTracking.PAC
			}
		}
	});
}

async function getPacScenario(userId: string) {
	return prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: PAC_SCENARIO_KEY
			}
		}
	});
}

describe('PAC scenario', () => {
	it('unlocks PAC on the first discovered skill', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const result = await discoverSkills(user.id, [11308]);
		expect(result.discoveredSkills).toEqual([11308]);
		expect(result.rewardUnlocked).toBe(Reward.PAC);
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect(updatedUser.discoveredSkills).toEqual([11308]);
		expect(await getPacRewardCount(user.id)).toBe(1);
		const stat = await getPacStat(user.id);
		expect(stat?.quantity).toBe(1);
		const scenario = await getPacScenario(user.id);
		expect(scenario).not.toBeNull();
		expect(scenario?.progression).toBe(PAC_SCENARIO_STEPS.COMPLETED);
		expect(scenario?.tracking).toBe(1);
		expect(scenario?.state).toEqual({
			completed: true,
			rewardId: Reward.PAC
		});
	});

	it('does nothing when the same skill is discovered again', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await discoverSkills(user.id, [11308]);
		const result = await discoverSkills(user.id, [11308]);
		expect(result.discoveredSkills).toEqual([]);
		expect(result.rewardUnlocked).toBeUndefined();
		expect(await getPacRewardCount(user.id)).toBe(1);
		expect((await getPacStat(user.id))?.quantity).toBe(1);
	});

	it('records later skills without rewarding PAC again', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await discoverSkills(user.id, [11308]);
		const result = await discoverSkills(user.id, [21303]);
		expect(result.discoveredSkills).toEqual([21303]);
		expect(result.rewardUnlocked).toBeUndefined();
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect(updatedUser.discoveredSkills).toEqual(expect.arrayContaining([11308, 21303]));
		expect(updatedUser.discoveredSkills).toHaveLength(2);
		expect(await getPacRewardCount(user.id)).toBe(1);
		expect((await getPacStat(user.id))?.quantity).toBe(1);
	});

	it('deduplicates skill ids from the same discovery', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const result = await discoverSkills(user.id, [11308, 11308, 11308]);
		expect(result.discoveredSkills).toEqual([11308]);
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect(updatedUser.discoveredSkills).toEqual([11308]);
		expect(await getPacRewardCount(user.id)).toBe(1);
	});

	it('rewards PAC only once during concurrent discovery of the same skill', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const results = await Promise.all([discoverSkills(user.id, [11308]), discoverSkills(user.id, [11308])]);
		const discovered = results.flatMap(result => result.discoveredSkills);
		expect(discovered).toEqual([11308]);
		expect(results.filter(result => result.rewardUnlocked === Reward.PAC)).toHaveLength(1);
		expect(await getPacRewardCount(user.id)).toBe(1);
		expect((await getPacStat(user.id))?.quantity).toBe(1);
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect(updatedUser.discoveredSkills).toEqual([11308]);
	});

	it('preserves both skills during concurrent discovery of different skills', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const results = await Promise.all([discoverSkills(user.id, [11308]), discoverSkills(user.id, [21303])]);
		const discovered = results.flatMap(result => result.discoveredSkills).sort((a, b) => a - b);
		expect(discovered).toEqual([11308, 21303].sort((a, b) => a - b));
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect([...updatedUser.discoveredSkills].sort((a, b) => a - b)).toEqual([11308, 21303].sort((a, b) => a - b));
		expect(await getPacRewardCount(user.id)).toBe(1);
		expect(results.filter(result => result.rewardUnlocked === Reward.PAC)).toHaveLength(1);
		expect((await getPacStat(user.id))?.quantity).toBe(1);
	});

	it('rolls back skill discovery and PAC reward together', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		await expect(
			prisma.$transaction(async tx => {
				await discoverUserSkillsTx(tx, {
					userId: user.id,
					skillIds: [11308]
				});

				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			},
			select: {
				discoveredSkills: true
			}
		});
		expect(updatedUser.discoveredSkills).toEqual([]);
		expect(await getPacRewardCount(user.id)).toBe(0);
		expect(await getPacStat(user.id)).toBeNull();
		expect(await getPacScenario(user.id)).toBeNull();
	});

	it('does nothing for an empty skill list', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const result = await discoverSkills(user.id, []);
		expect(result).toEqual({
			discoveredSkills: [],
			rewardUnlocked: undefined
		});
		expect(await getPacRewardCount(user.id)).toBe(0);
		expect(await getPacScenario(user.id)).toBeNull();
	});
});
