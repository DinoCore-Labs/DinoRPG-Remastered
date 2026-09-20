import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

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
