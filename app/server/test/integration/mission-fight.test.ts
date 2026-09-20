import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { processMissionFight } from '../../src/Fight/Service/processMissionFight.service.js';
import { startMissionInteraction } from '../../src/Mission/Controller/missionInteract.controller.js';
import { prisma } from '../../src/prisma.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

vi.mock('../../src/Fight/Service/processMissionFight.service.js', () => ({
	processMissionFight: vi.fn()
}));

const processMissionFightMock = vi.mocked(processMissionFight);

beforeEach(async () => {
	await cleanDatabase();
	processMissionFightMock.mockReset();
});

function getGoalIndex(missionKey: string, goalType: string) {
	const mission = missionList.find(entry => entry.key === missionKey);
	if (!mission) {
		throw new Error(`Mission "${missionKey}" not found`);
	}
	const progression = mission.goals.findIndex(goal => goal.type === goalType);
	if (progression < 0) {
		throw new Error(`${goalType} goal not found in "${missionKey}"`);
	}
	return progression;
}

async function createMissionState(dinozId: number, missionKey: string, progression: number) {
	return prisma.dinozMissions.create({
		data: {
			dinozId,
			missionKey,
			progression,
			tracking: 0,
			isCompleted: false
		}
	});
}

describe('mission fight goals', () => {
	it('advances a FIGHT goal after a victory', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.CHUTES_MUTANTES
		});
		const progression = getGoalIndex('elmawater', 'FIGHT');
		await createMissionState(dinoz.id, 'elmawater', progression);
		processMissionFightMock.mockResolvedValue({
			result: true,
			source: 'mission'
		} as never);
		const result = await startMissionInteraction(user.id, dinoz.id);
		expect(result.mode).toBe('fight');
		if (result.mode !== 'fight') {
			throw new Error('Expected fight result');
		}
		expect(result.goalType).toBe('FIGHT');
		expect(result.fight.missionCompletion).toMatchObject({
			ok: true,
			completed: false
		});
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'elmawater',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression + 1);
	});

	it('does not advance a FIGHT_ACTION goal after a defeat', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.MARAIS_COLLANT
		});
		const progression = getGoalIndex('skul2', 'FIGHT_ACTION');
		await createMissionState(dinoz.id, 'skul2', progression);
		processMissionFightMock.mockResolvedValue({
			result: false,
			source: 'mission'
		} as never);
		const result = await startMissionInteraction(user.id, dinoz.id);
		expect(result.mode).toBe('fight');
		if (result.mode !== 'fight') {
			throw new Error('Expected fight result');
		}
		expect(result.goalType).toBe('FIGHT_ACTION');
		expect(result.fight.missionCompletion).toBeNull();
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'skul2',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression);
	});

	it('advances a FIGHT_ACTION goal after a victory', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.MARAIS_COLLANT
		});
		const progression = getGoalIndex('skul2', 'FIGHT_ACTION');
		await createMissionState(dinoz.id, 'skul2', progression);
		processMissionFightMock.mockResolvedValue({
			result: true,
			source: 'mission'
		} as never);
		const result = await startMissionInteraction(user.id, dinoz.id);
		expect(result.mode).toBe('fight');
		if (result.mode !== 'fight') {
			throw new Error('Expected fight result');
		}
		expect(result.fight.missionCompletion).toMatchObject({
			ok: true,
			completed: false
		});
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'skul2',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression + 1);
	});

	it('rejects a FIGHT_ACTION from the wrong place', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		const progression = getGoalIndex('skul2', 'FIGHT_ACTION');
		await createMissionState(dinoz.id, 'skul2', progression);
		await expect(startMissionInteraction(user.id, dinoz.id)).rejects.toThrow(
			'Mission action is not available at place'
		);
		expect(processMissionFightMock).not.toHaveBeenCalled();
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'skul2',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression);
	});
});
