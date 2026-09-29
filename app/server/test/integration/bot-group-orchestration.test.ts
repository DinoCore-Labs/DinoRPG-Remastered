import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { createBotGroup, getBotGroupPlan, getBotUngroupPlan, ungroupBotDinoz } from '../../src/Bot/Service/botGroup.service.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

describe('bot group orchestration', () => {
	it('splits a follower for a personal mission and can regroup later', async () => {
		const user = await createTestUser({
			name: 'GroupMissionBot',
			withTutorial: false
		});
		const leader = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			level: 5,
			canRename: false
		});
		const follower = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			level: 3,
			canRename: false,
			leaderId: leader.id
		});

		await prisma.dinozMissions.create({
			data: {
				dinozId: follower.id,
				missionKey: 'fish',
				progression: 0,
				tracking: 0,
				isCompleted: false
			}
		});

		await expect(getBotUngroupPlan(user.id)).resolves.toBe(follower.id);
		await expect(ungroupBotDinoz(user.id)).resolves.toBe(true);

		const detached = await prisma.dinoz.findUniqueOrThrow({
			where: { id: follower.id }
		});
		expect(detached.leaderId).toBeNull();

		await prisma.dinozMissions.deleteMany({
			where: { dinozId: follower.id }
		});

		const regroupPlan = await getBotGroupPlan(user.id);
		expect(regroupPlan).toEqual({
			leaderId: leader.id,
			followerId: follower.id
		});

		await expect(createBotGroup(user.id)).resolves.toBe(true);

		const regrouped = await prisma.dinoz.findUniqueOrThrow({
			where: { id: follower.id }
		});
		expect(regrouped.leaderId).toBe(leader.id);
	});
});
