import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { BotDinozRole } from '../../../prisma/index.js';
import {
	createBotGroup,
	getBotGroupPlan,
	getBotUngroupPlan,
	ungroupBotDinoz
} from '../../src/Bot/Service/botGroup.service.js';
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

	it('prefers a fighter as group leader even when another Dinoz has a higher level', async () => {
		const user = await createTestUser({
			name: 'GroupRoleLeaderBot',
			withTutorial: false
		});
		const fighter = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			level: 4,
			canRename: false
		});
		const gatherer = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			level: 12,
			canRename: false
		});

		await prisma.botDinozMemory.createMany({
			data: [
				{ dinozId: fighter.id, role: BotDinozRole.FIGHTER },
				{ dinozId: gatherer.id, role: BotDinozRole.GATHERER }
			]
		});

		await expect(getBotGroupPlan(user.id)).resolves.toEqual({
			leaderId: fighter.id,
			followerId: gatherer.id
		});
	});

	it('keeps an explorer autonomous instead of grouping it', async () => {
		const user = await createTestUser({
			name: 'GroupExplorerBot',
			withTutorial: false
		});
		const fighter = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});
		const explorer = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});

		await prisma.botDinozMemory.createMany({
			data: [
				{ dinozId: fighter.id, role: BotDinozRole.FIGHTER },
				{ dinozId: explorer.id, role: BotDinozRole.EXPLORER }
			]
		});

		await expect(getBotGroupPlan(user.id)).resolves.toBeNull();
	});

	it('keeps a gatherer autonomous on a place where it can gather', async () => {
		const user = await createTestUser({
			name: 'GroupGathererBot',
			withTutorial: false
		});
		const fighter = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			canRename: false
		});
		const gatherer = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PENTES_DE_BASALTE,
			canRename: false
		});

		await prisma.botDinozMemory.createMany({
			data: [
				{ dinozId: fighter.id, role: BotDinozRole.FIGHTER },
				{ dinozId: gatherer.id, role: BotDinozRole.GATHERER }
			]
		});

		await expect(getBotGroupPlan(user.id)).resolves.toBeNull();
	});

	it('ungroups a follower when its persistent role needs autonomy', async () => {
		const user = await createTestUser({
			name: 'UngroupRoleBot',
			withTutorial: false
		});
		const leader = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});
		const follower = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			leaderId: leader.id,
			canRename: false
		});
		await prisma.botDinozMemory.create({
			data: {
				dinozId: follower.id,
				role: BotDinozRole.EXPLORER
			}
		});

		await expect(getBotUngroupPlan(user.id)).resolves.toBe(follower.id);
	});

	it('does not immediately regroup after a successful ungroup action', async () => {
		const user = await createTestUser({
			name: 'RegroupCooldownBot',
			withTutorial: false
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE,
			canRename: false
		});
		const profile = await prisma.botProfile.create({
			data: {
				userId: user.id
			}
		});
		await prisma.botActionLog.create({
			data: {
				botProfileId: profile.id,
				action: 'ungroup',
				success: true
			}
		});

		await expect(getBotGroupPlan(user.id)).resolves.toBeNull();
	});
});
