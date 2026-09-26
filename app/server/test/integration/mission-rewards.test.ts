import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import { MissionReward } from '@dinorpg/core/models/missions/missionReward.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { applyMissionRewards } from '../../src/Mission/Controller/mission.rewards.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

beforeAll(async () => {
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
});

afterAll(async () => {
	await server.close();
});

async function completeMission(user: Awaited<ReturnType<typeof createTestUser>>, dinozId: number) {
	return server.inject({
		method: 'POST',
		url: `/api/missions/dinoz/${dinozId}/mission/action/complete`,
		headers: {
			cookie: createAuthCookie(server, user)
		},
		payload: {
			trigger: 'manual'
		}
	});
}

async function createMissionAtFinalGoal(params: { dinozId: number; missionKey: string; progression: number }) {
	return prisma.dinozMissions.create({
		data: {
			dinozId: params.dinozId,
			missionKey: params.missionKey,
			progression: params.progression,
			tracking: 0,
			isCompleted: false
		}
	});
}

function createTestMissionDefinition(rewards: MissionReward[]): MissionDefinition {
	return {
		key: 'test_reward_mission',
		group: 'test',
		nameKey: 'test.name',
		beginKey: 'test.begin',
		endKey: 'test.end',
		goals: [],
		rewards,
		labels: {}
	};
}

function getMissionDefinition(missionKey: string) {
	const definition = missionList.find(mission => mission.key === missionKey);
	if (!definition) {
		throw new Error(`Mission "${missionKey}" not found`);
	}
	return definition;
}

describe('mission completion and rewards', () => {
	it('completes a mission and grants its XP reward', async () => {
		const user = await createTestUser({
			name: 'MissionRewardXP',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			experience: 0
		});
		await createMissionAtFinalGoal({
			dinozId: dinoz.id,
			missionKey: 'fish',
			progression: 4
		});
		const response = await completeMission(user, dinoz.id);
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			ok: true,
			completed: true,
			rewardModal: {
				missionKey: 'fish',
				rewards: [
					{
						type: 'XP',
						value: 20
					}
				]
			}
		});
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(5);
		expect(mission.tracking).toBe(0);
		expect(mission.isCompleted).toBe(true);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(20);
	});

	it('does not complete a validation goal at the wrong place', async () => {
		const user = await createTestUser({
			name: 'MissionWrongValidatePlace',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE,
			experience: 0
		});
		await createMissionAtFinalGoal({
			dinozId: dinoz.id,
			missionKey: 'fish',
			progression: 4
		});
		const response = await completeMission(user, dinoz.id);
		expect(response.statusCode).toBe(400);
		expect(response.json().message).toContain('Mission action is not available at place');
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(4);
		expect(mission.isCompleted).toBe(false);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(0);
	});

	it('grants the mission reward only once during concurrent completion', async () => {
		const user = await createTestUser({
			name: 'ConcurrentMissionReward',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			experience: 0
		});
		await createMissionAtFinalGoal({
			dinozId: dinoz.id,
			missionKey: 'fish',
			progression: 4
		});
		const responses = await Promise.all([completeMission(user, dinoz.id), completeMission(user, dinoz.id)]);
		const statusCodes = responses.map(response => response.statusCode).sort();
		expect(statusCodes).toEqual([200, 400]);
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.isCompleted).toBe(true);
		expect(mission.progression).toBe(5);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(20);
	});

	it('grants XP and item rewards when completing dog', async () => {
		const user = await createTestUser({
			name: 'MissionItemReward',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			experience: 0
		});
		await createMissionAtFinalGoal({
			dinozId: dinoz.id,
			missionKey: 'dog',
			progression: 6
		});
		const potionAngel = Object.values(itemList).find(item => item.name === 'potion_angel');
		expect(potionAngel).toBeDefined();
		if (!potionAngel) {
			throw new Error('potion_angel item not found');
		}
		const response = await completeMission(user, dinoz.id);
		expect(response.statusCode).toBe(200);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(15);
		const item = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					itemId: potionAngel.itemId,
					userId: user.id
				}
			}
		});
		expect(item).not.toBeNull();
		expect(item?.quantity).toBe(1);
	});

	it('grants XP and Gold rewards when completing kilgou', async () => {
		const user = await createTestUser({
			name: 'MissionGoldReward',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			experience: 0
		});
		await createMissionAtFinalGoal({
			dinozId: dinoz.id,
			missionKey: 'kilgou',
			progression: 2
		});
		const walletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		const response = await completeMission(user, dinoz.id);
		expect(response.statusCode).toBe(200);
		const walletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfter.amount).toBe(walletBefore.amount + 500);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(30);
	});
});

describe('mission reward atomicity', () => {
	it('rolls back collection, tracking and XP rewards together', async () => {
		const user = await createTestUser({
			name: 'CollectionRollback',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			experience: 0
		});
		const definition = getMissionDefinition('msg');
		await expect(
			prisma.$transaction(async tx => {
				await applyMissionRewards(tx, {
					dinozId: dinoz.id,
					definition
				});
				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const rewardId = rewardIdByKey.msg;
		const collection = await prisma.userRewards.findUnique({
			where: {
				rewardId_userId: {
					rewardId,
					userId: user.id
				}
			}
		});
		expect(collection).toBeNull();
		const tracking = await prisma.userTracking.findUnique({
			where: {
				stat_userId: {
					stat: StatTracking.MSG,
					userId: user.id
				}
			}
		});
		expect(tracking).toBeNull();
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(0);
	});

	it('rolls back effect and XP rewards together', async () => {
		const user = await createTestUser({
			name: 'EffectRollback',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			experience: 0
		});
		const definition = getMissionDefinition('bckpck');
		const statusId = dinozStatusIdByKey.bckpck;
		expect(statusId).toBeDefined();
		if (statusId === undefined) {
			throw new Error('bckpck status not found');
		}
		await expect(
			prisma.$transaction(async tx => {
				await applyMissionRewards(tx, {
					dinozId: dinoz.id,
					definition
				});
				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const status = await prisma.dinozStatus.findUnique({
			where: {
				statusId_dinozId: {
					statusId,
					dinozId: dinoz.id
				}
			}
		});
		expect(status).toBeNull();
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(0);
	});

	it('commits effect rewards when the transaction succeeds', async () => {
		const user = await createTestUser({
			name: 'EffectCommit',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			experience: 0
		});
		const definition = getMissionDefinition('bckpck');
		const statusId = dinozStatusIdByKey.bckpck;
		expect(statusId).toBeDefined();
		if (statusId === undefined) {
			throw new Error('bckpck status not found');
		}
		await prisma.$transaction(tx =>
			applyMissionRewards(tx, {
				dinozId: dinoz.id,
				definition
			})
		);
		const status = await prisma.dinozStatus.findUnique({
			where: {
				statusId_dinozId: {
					statusId,
					dinozId: dinoz.id
				}
			}
		});
		expect(status).not.toBeNull();
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(40);
	});

	it('grants ingredient rewards transactionally', async () => {
		const user = await createTestUser({
			name: 'IngredientReward',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const ingredient = Object.values(ingredientList).find(entry => entry.name === 'merou_lujidane');
		expect(ingredient).toBeDefined();
		if (!ingredient) {
			throw new Error('merou_lujidane not found');
		}
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: ingredient.ingredientId,
				quantity: 2
			}
		});
		const definition = createTestMissionDefinition([
			{
				type: 'INGREDIENT',
				ingredientKey: 'merou_lujidane',
				quantity: 3
			}
		]);
		await prisma.$transaction(tx =>
			applyMissionRewards(tx, {
				dinozId: dinoz.id,
				definition
			})
		);
		const stored = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					ingredientId: ingredient.ingredientId,
					userId: user.id
				}
			}
		});
		expect(stored.quantity).toBe(5);
	});

	it('rolls back ingredient rewards when the transaction fails', async () => {
		const user = await createTestUser({
			name: 'IngredientRollback',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			experience: 0
		});
		const ingredient = Object.values(ingredientList).find(entry => entry.name === 'merou_lujidane');
		expect(ingredient).toBeDefined();
		if (!ingredient) {
			throw new Error('merou_lujidane not found');
		}
		const definition = createTestMissionDefinition([
			{
				type: 'INGREDIENT',
				ingredientKey: 'merou_lujidane',
				quantity: 3
			},
			{
				type: 'XP',
				value: 25
			}
		]);
		await expect(
			prisma.$transaction(async tx => {
				await applyMissionRewards(tx, {
					dinozId: dinoz.id,
					definition
				});

				throw new Error('force rollback');
			})
		).rejects.toThrow('force rollback');
		const storedIngredient = await prisma.userIngredients.findUnique({
			where: {
				ingredientId_userId: {
					ingredientId: ingredient.ingredientId,
					userId: user.id
				}
			}
		});
		expect(storedIngredient).toBeNull();
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(0);
	});

	it.each([
		{
			reward: {
				type: 'USER_VAR',
				userVarKey: 'test_var'
			} as const,
			expected: 'Mission reward type "USER_VAR" is not implemented yet'
		},
		{
			reward: {
				type: 'GAME_VAR',
				gameVarKey: 'test_var'
			} as const,
			expected: 'Mission reward type "GAME_VAR" is not implemented yet'
		}
	])('rolls back previous rewards when $reward.type is unsupported', async ({ reward, expected }) => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			experience: 0
		});
		const definition = createTestMissionDefinition([
			{
				type: 'XP',
				value: 100
			},
			reward
		]);
		await expect(
			prisma.$transaction(tx =>
				applyMissionRewards(tx, {
					dinozId: dinoz.id,
					definition
				})
			)
		).rejects.toThrow(expected);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.experience).toBe(0);
	});
});
