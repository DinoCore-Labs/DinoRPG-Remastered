import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import { beforeEach, describe, expect, it } from 'vitest';

import {
	advanceDinozMissionOnAction,
	advanceDinozMissionOnFightWon,
	advanceDinozMissionOnMove,
	advanceDinozMissionOnTalk,
	advanceDinozMissionOnWait,
	unlockDinozMission
} from '../../src/Mission/Controller/mission.progress.js';
import { completeMissionInteraction } from '../../src/Mission/Controller/missionInteract.controller.js';
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

function getGoalIndex(missionKey: string, type: string) {
	const mission = missionList.find(entry => entry.key === missionKey);
	if (!mission) {
		throw new Error(`Mission "${missionKey}" not found`);
	}
	const index = mission.goals.findIndex(goal => goal.type === type);
	if (index === -1) {
		throw new Error(`${type} goal not found in "${missionKey}"`);
	}
	return index;
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

	it('advances WAIT only after its duration has elapsed', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const definition = missionList.find(mission => mission.key === 'mmex3')!;
		const progression = definition.goals.findIndex(goal => goal.type === 'WAIT');
		const goal = definition.goals[progression];
		if (goal.type !== 'WAIT') {
			throw new Error('Expected WAIT goal');
		}
		const mission = await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'mmex3',
				progression
			}
		});
		await prisma.dinozMissions.update({
			where: {
				id: mission.id
			},
			data: {
				updatedAt: new Date(Date.now() - (goal.duration - 10) * 1000)
			}
		});
		const tooEarly = await prisma.$transaction(tx => advanceDinozMissionOnWait(tx, dinoz.id));
		expect(tooEarly).toBeNull();
		await prisma.dinozMissions.update({
			where: {
				id: mission.id
			},
			data: {
				updatedAt: new Date(Date.now() - (goal.duration + 10) * 1000)
			}
		});
		const result = await prisma.$transaction(tx => advanceDinozMissionOnWait(tx, dinoz.id));
		expect(result).toMatchObject({
			missionKey: 'mmex3',
			progression: progression + 1
		});
	});

	it('unlocks a LOCK mission goal explicitly', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id
		});
		const definition = missionList.find(mission => mission.key === 'skuend')!;
		const progression = definition.goals.findIndex(goal => goal.type === 'LOCK');
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'skuend',
				progression
			}
		});
		const wrongMission = await prisma.$transaction(tx =>
			unlockDinozMission(tx, {
				dinozId: dinoz.id,
				missionKey: 'fish'
			})
		);
		expect(wrongMission).toBeNull();
		const unlocked = await prisma.$transaction(tx =>
			unlockDinozMission(tx, {
				dinozId: dinoz.id,
				missionKey: 'skuend'
			})
		);
		expect(unlocked).toMatchObject({
			missionKey: 'skuend',
			progression: progression + 1,
			tracking: 0,
			isCompleted: false
		});
	});
});

describe('mission resource consumption', () => {
	it('consumes the required item and advances the mission', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE
		});
		const progression = getGoalIndex('skul1', 'USE_ITEM');
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'skul1',
				progression
			}
		});
		const item = Object.values(itemList).find(entry => entry.name === 'goblin_merguez');
		expect(item).toBeDefined();
		if (!item) {
			throw new Error('goblin_merguez not found');
		}
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: item.itemId,
				quantity: 5
			}
		});
		await completeMissionInteraction({
			userId: user.id,
			dinozId: dinoz.id,
			trigger: 'manual'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					itemId: item.itemId,
					userId: user.id
				}
			}
		});
		expect(inventory.quantity).toBe(2);
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'skul1',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression + 1);
	});

	it('does not consume an item when quantity is insufficient', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PAPY_JOE
		});
		const progression = getGoalIndex('skul1', 'USE_ITEM');
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'skul1',
				progression
			}
		});
		const item = Object.values(itemList).find(entry => entry.name === 'goblin_merguez')!;
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: item.itemId,
				quantity: 2
			}
		});
		await expect(
			completeMissionInteraction({
				userId: user.id,
				dinozId: dinoz.id,
				trigger: 'manual'
			})
		).rejects.toMatchObject({
			code: 'notEnoughItems'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					itemId: item.itemId,
					userId: user.id
				}
			}
		});
		expect(inventory.quantity).toBe(2);
		const mission = await prisma.dinozMissions.findUniqueOrThrow({
			where: {
				missionKey_dinozId: {
					missionKey: 'skul1',
					dinozId: dinoz.id
				}
			}
		});
		expect(mission.progression).toBe(progression);
	});

	it('consumes ingredients and advances the mission', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FOSSELAVE
		});
		const progression = getGoalIndex('elmaair', 'USE_INGREDIENT');
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'elmaair',
				progression
			}
		});
		const ingredient = Object.values(ingredientList).find(entry => entry.name === 'energie_air')!;
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId: ingredient.ingredientId,
				quantity: 5
			}
		});
		await completeMissionInteraction({
			userId: user.id,
			dinozId: dinoz.id,
			trigger: 'manual'
		});
		const inventory = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					ingredientId: ingredient.ingredientId,
					userId: user.id
				}
			}
		});
		expect(inventory.quantity).toBe(3);
	});

	it('consumes Treasure Tickets and advances the mission', async () => {
		const user = await createTestUser({
			withTutorial: false
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DOME_SOULAFLOTTE
		});
		const progression = getGoalIndex('skul5', 'USE_MONEY');
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'skul5',
				progression
			}
		});
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			},
			data: {
				amount: 5
			}
		});
		await completeMissionInteraction({
			userId: user.id,
			dinozId: dinoz.id,
			trigger: 'manual'
		});
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(wallet.amount).toBe(2);
	});
});
