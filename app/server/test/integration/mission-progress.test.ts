import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	advanceDinozMissionOnAction,
	advanceDinozMissionOnFightWon,
	advanceDinozMissionOnMove,
	advanceDinozMissionOnTalk
} from '../../src/Mission/Controller/mission.progress.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function createMission(params: { dinozId: number; missionKey: string; progression?: number; tracking?: number }) {
	return prisma.dinozMissions.create({
		data: {
			dinozId: params.dinozId,
			missionKey: params.missionKey,
			progression: params.progression ?? 0,
			tracking: params.tracking ?? 0,
			isCompleted: false
		}
	});
}

async function getMission(dinozId: number, missionKey: string) {
	return prisma.dinozMissions.findUniqueOrThrow({
		where: {
			missionKey_dinozId: {
				dinozId,
				missionKey
			}
		}
	});
}

describe('mission progression', () => {
	it('advances an AT goal when the Dinoz reaches the expected place', async () => {
		const user = await createTestUser({
			name: 'MissionMove',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnMove(tx, {
				dinozId: dinoz.id,
				place: PlaceEnum.PORT_DE_PRECHE
			})
		);
		expect(result).toEqual({
			missionKey: 'fish',
			progression: 1,
			tracking: 0,
			isCompleted: false
		});
		const mission = await getMission(dinoz.id, 'fish');
		expect(mission.progression).toBe(1);
		expect(mission.tracking).toBe(0);
		expect(mission.isCompleted).toBe(false);
	});

	it('does not advance an AT goal at the wrong place', async () => {
		const user = await createTestUser({
			name: 'MissionWrongMove',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'fish'
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnMove(tx, {
				dinozId: dinoz.id,
				place: PlaceEnum.DINOVILLE
			})
		);
		expect(result).toBeNull();
		const mission = await getMission(dinoz.id, 'fish');
		expect(mission.progression).toBe(0);
		expect(mission.tracking).toBe(0);
	});

	it('advances a TALK goal with the expected NPC', async () => {
		const user = await createTestUser({
			name: 'MissionTalk',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'fish',
			progression: 1
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnTalk(tx, {
				dinozId: dinoz.id,
				npcKey: 'fish_merchant'
			})
		);
		expect(result).toEqual({
			missionKey: 'fish',
			progression: 2,
			tracking: 0,
			isCompleted: false
		});
		const mission = await getMission(dinoz.id, 'fish');
		expect(mission.progression).toBe(2);
	});

	it('does not advance a TALK goal with another NPC', async () => {
		const user = await createTestUser({
			name: 'MissionWrongTalk',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'fish',
			progression: 1
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnTalk(tx, {
				dinozId: dinoz.id,
				npcKey: 'madame_seyche'
			})
		);
		expect(result).toBeNull();
		const mission = await getMission(dinoz.id, 'fish');
		expect(mission.progression).toBe(1);
	});

	it('advances an ACTION goal with the expected action', async () => {
		const user = await createTestUser({
			name: 'MissionAction',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'dog',
			progression: 3
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnAction(tx, {
				dinozId: dinoz.id,
				actionKey: 'find_nioufniouf'
			})
		);
		expect(result).toEqual({
			missionKey: 'dog',
			progression: 4,
			tracking: 0,
			isCompleted: false
		});
		const mission = await getMission(dinoz.id, 'dog');
		expect(mission.progression).toBe(4);
	});

	it('does not advance an ACTION goal with another action', async () => {
		const user = await createTestUser({
			name: 'MissionWrongAction',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'dog',
			progression: 3
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnAction(tx, {
				dinozId: dinoz.id,
				actionKey: 'wrong_action'
			})
		);
		expect(result).toBeNull();
		const mission = await getMission(dinoz.id, 'dog');
		expect(mission.progression).toBe(3);
	});

	it('increments KILL tracking without advancing before reaching the target', async () => {
		const user = await createTestUser({
			name: 'MissionKills',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'kilgou',
			progression: 1
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['goupi', 'wolf'],
				place: PlaceEnum.COLLINES_ESCARPEES
			})
		);
		expect(result).toEqual({
			missionKey: 'kilgou',
			progression: 1,
			tracking: 2,
			isCompleted: false
		});
		const mission = await getMission(dinoz.id, 'kilgou');
		expect(mission.progression).toBe(1);
		expect(mission.tracking).toBe(2);
	});

	it('advances a KILL goal and resets tracking when the target is reached', async () => {
		const user = await createTestUser({
			name: 'MissionKillTarget',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'kilgou',
			progression: 1,
			tracking: 4
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['goupi2', 'goupi3'],
				place: PlaceEnum.COLLINES_ESCARPEES
			})
		);
		expect(result).toEqual({
			missionKey: 'kilgou',
			progression: 2,
			tracking: 0,
			isCompleted: false
		});
		const mission = await getMission(dinoz.id, 'kilgou');
		expect(mission.progression).toBe(2);
		expect(mission.tracking).toBe(0);
	});

	it('ignores monsters that do not match the KILL goal', async () => {
		const user = await createTestUser({
			name: 'MissionWrongMonster',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'kilgou',
			progression: 1,
			tracking: 2
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['gluon'],
				place: PlaceEnum.COLLINES_ESCARPEES
			})
		);
		expect(result).toBeNull();
		const mission = await getMission(dinoz.id, 'kilgou');
		expect(mission.progression).toBe(1);
		expect(mission.tracking).toBe(2);
	});

	it('ignores KILL progress at the wrong place', async () => {
		const user = await createTestUser({
			name: 'MissionWrongKillPlace',
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		await createMission({
			dinozId: dinoz.id,
			missionKey: 'kilgou',
			progression: 1,
			tracking: 2
		});
		const result = await prisma.$transaction(tx =>
			advanceDinozMissionOnFightWon(tx, {
				dinozId: dinoz.id,
				defeatedMonsterKeys: ['goupi', 'wolf'],
				place: PlaceEnum.DINOVILLE
			})
		);
		expect(result).toBeNull();
		const mission = await getMission(dinoz.id, 'kilgou');
		expect(mission.progression).toBe(1);
		expect(mission.tracking).toBe(2);
	});
});
