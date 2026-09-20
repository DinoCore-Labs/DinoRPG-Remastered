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

async function startMission(params: {
	user: Awaited<ReturnType<typeof createTestUser>>;
	dinozId: number;
	missionKey: string;
}) {
	return server.inject({
		method: 'POST',
		url: `/api/missions/dinoz/${params.dinozId}/mission/${params.missionKey}/start`,
		headers: {
			cookie: createAuthCookie(server, params.user)
		}
	});
}

describe('mission lifecycle', () => {
	it('starts an available mission', async () => {
		const user = await createTestUser({
			name: 'MissionStarter',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const response = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			success: true,
			missionKey: 'fish',
			progression: 0,
			tracking: 0,
			isCompleted: false
		});
		const mission = await prisma.dinozMissions.findUnique({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission).not.toBeNull();
		expect(mission).toMatchObject({
			missionKey: 'fish',
			progression: 0,
			tracking: 0,
			isCompleted: false,
			dinozId: dinoz.id
		});
	});

	it('rejects starting the same active mission twice', async () => {
		const user = await createTestUser({
			name: 'DuplicateMission',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const firstResponse = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		expect(firstResponse.statusCode).toBe(200);
		const secondResponse = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		expect(secondResponse.statusCode).toBe(403);
		expect(secondResponse.json()).toEqual({
			message: 'Mission "fish" is already active for this dinoz'
		});
		const missions = await prisma.dinozMissions.findMany({
			where: {
				dinozId: dinoz.id
			}
		});
		expect(missions).toHaveLength(1);
	});

	it('rejects another mission while one is already active', async () => {
		const user = await createTestUser({
			name: 'SingleActiveMission',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		const response = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'dog'
		});
		expect(response.statusCode).toBe(403);
		expect(response.json()).toEqual({
			message: `Dinoz "${dinoz.id}" already has an active mission "fish"`
		});
		const missions = await prisma.dinozMissions.findMany({
			where: {
				dinozId: dinoz.id
			}
		});
		expect(missions).toHaveLength(1);
		expect(missions[0].missionKey).toBe('fish');
	});

	it('rejects a mission when its prerequisite is not completed', async () => {
		const user = await createTestUser({
			name: 'LockedMission',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const response = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'kilgou'
		});
		expect(response.statusCode).toBe(403);
		expect(response.json()).toEqual({
			message: 'Mission start conditions are not satisfied'
		});
		const mission = await prisma.dinozMissions.findUnique({
			where: {
				missionKey_dinozId: {
					missionKey: 'kilgou',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission).toBeNull();
	});

	it('allows a mission when its prerequisite is completed', async () => {
		const user = await createTestUser({
			name: 'UnlockedMission',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'fish',
				progression: 5,
				tracking: 0,
				isCompleted: true
			}
		});
		const response = await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'kilgou'
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			success: true,
			missionKey: 'kilgou',
			progression: 0,
			tracking: 0,
			isCompleted: false
		});
		const mission = await prisma.dinozMissions.findUnique({
			where: {
				missionKey_dinozId: {
					missionKey: 'kilgou',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission).toMatchObject({
			missionKey: 'kilgou',
			isCompleted: false
		});
	});

	it('rejects access to another player Dinoz', async () => {
		const owner = await createTestUser({
			name: 'MissionOwner',
			withTutorial: false
		});
		const attacker = await createTestUser({
			name: 'MissionAttacker',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: owner.id
		});
		const response = await startMission({
			user: attacker,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		expect(response.statusCode).toBe(403);
		expect(response.json()).toEqual({
			message: `You are not allowed to access dinoz "${dinoz.id}"`
		});
		expect(await prisma.dinozMissions.count()).toBe(0);
	});

	it('abandons an active mission', async () => {
		const user = await createTestUser({
			name: 'MissionAbort',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await startMission({
			user,
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		const response = await server.inject({
			method: 'POST',
			url: `/api/missions/dinoz/${dinoz.id}/mission/fish/stop`,
			headers: {
				cookie: createAuthCookie(server, user)
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			success: true,
			missionKey: 'fish',
			aborted: true
		});
		const mission = await prisma.dinozMissions.findUnique({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission).toBeNull();
	});

	it('rejects abandoning a completed mission', async () => {
		const user = await createTestUser({
			name: 'CompletedMissionAbort',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'fish',
				progression: 5,
				tracking: 0,
				isCompleted: true
			}
		});
		const response = await server.inject({
			method: 'POST',
			url: `/api/missions/dinoz/${dinoz.id}/mission/fish/stop`,
			headers: {
				cookie: createAuthCookie(server, user)
			}
		});
		expect(response.statusCode).toBe(403);
		expect(response.json()).toEqual({
			message: 'Mission "fish" is already completed and cannot be abandoned'
		});
		const mission = await prisma.dinozMissions.findUnique({
			where: {
				missionKey_dinozId: {
					missionKey: 'fish',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission).not.toBeNull();
	});
});
