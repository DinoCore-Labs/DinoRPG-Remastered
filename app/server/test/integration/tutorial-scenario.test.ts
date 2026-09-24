import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import {
	TUTORIAL_COMPLETED_PROGRESSION,
	TUTORIAL_SCENARIO_KEY,
	type TutorialObjectiveKey,
	tutorialObjectiveKeys
} from '@dinorpg/core/models/tutorial/tutorial.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import {
	getCurrentTutorial,
	handleTutorialEvent,
	handleTutorialEventTx,
	refreshTutorialProgress
} from '../../src/Tutorial/Controller/tutorial.controller.js';
import { assertTutorialMovementAllowed } from '../../src/Tutorial/Controller/tutorial.movement.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

function getObjectiveProgression(objectiveId: TutorialObjectiveKey): number {
	const progression = tutorialObjectiveKeys.indexOf(objectiveId);
	if (progression === -1) {
		throw new Error(`Unknown tutorial objective "${objectiveId}"`);
	}
	return progression;
}

async function getTutorialProgression(userId: string): Promise<number | null> {
	const tutorial = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: TUTORIAL_SCENARIO_KEY
			}
		},
		select: {
			progression: true
		}
	});
	return tutorial?.progression ?? null;
}

async function setTutorialProgression(userId: string, progression: number): Promise<void> {
	await prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: TUTORIAL_SCENARIO_KEY
			}
		},
		create: {
			userId,
			scenarioKey: TUTORIAL_SCENARIO_KEY,
			progression
		},
		update: {
			progression
		}
	});
}

async function setIntroProgression(userId: string, progression: number): Promise<void> {
	await prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: 'intro'
			}
		},
		create: {
			userId,
			scenarioKey: 'intro',
			progression
		},
		update: {
			progression
		}
	});
}

async function setTracking(userId: string, stat: StatTracking, quantity: number): Promise<void> {
	await prisma.userTracking.upsert({
		where: {
			stat_userId: {
				userId,
				stat
			}
		},
		create: {
			userId,
			stat,
			quantity
		},
		update: {
			quantity
		}
	});
}

async function getGold(userId: string): Promise<number> {
	const wallet = await prisma.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: 'GOLD'
			}
		},
		select: {
			amount: true
		}
	});
	return wallet.amount;
}

async function getItemQuantity(userId: string, itemId: number): Promise<number> {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId
			}
		},
		select: {
			quantity: true
		}
	});
	return item?.quantity ?? 0;
}

async function expectCurrentObjective(userId: string, expected: TutorialObjectiveKey | null): Promise<void> {
	const tutorial = await getCurrentTutorial(userId);
	expect(tutorial).not.toBeNull();
	if (!tutorial) {
		return;
	}
	if (expected === null) {
		expect(tutorial.completed).toBe(true);
		expect(tutorial.objective).toBeNull();
		return;
	}
	expect(tutorial.completed).toBe(false);
	expect(tutorial.objective?.id).toBe(expected);
}

describe('Tutorial scenario', () => {
	describe('full progression', () => {
		it('completes every tutorial objective and grants every reward exactly once', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.DINOVILLE,
				canRename: false
			});
			const initialGold = await getGold(user.id);
			/*
			 * 0 — dinoz
			 */
			await expectCurrentObjective(user.id, 'dinoz');
			const adopted = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'DINOZ_ADOPTED'
			});
			expect(adopted).toMatchObject({
				active: true,
				advanced: true,
				completed: false,
				completedObjectiveId: 'dinoz',
				currentObjectiveId: 'speak'
			});
			expect(await getTutorialProgression(user.id)).toBe(getObjectiveProgression('speak'));
			expect(await getGold(user.id)).toBe(initialGold);
			/*
			 * 1 — speak
			 *
			 * Guide Michel :
			 * +100 or.
			 */
			const spoken = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'GUIDE_MICHEL_SPOKEN'
			});
			expect(spoken).toMatchObject({
				advanced: true,
				completedObjectiveId: 'speak',
				currentObjectiveId: 'move'
			});
			expect(await getGold(user.id)).toBe(initialGold + 100);
			/*
			 * 2 — move
			 *
			 * uvar(moves, 1+)
			 * +500 or.
			 */
			await setTracking(user.id, StatTracking.MOVES, 1);
			const moved = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(moved).toMatchObject({
				advanced: true,
				completedObjectiveId: 'move',
				currentObjectiveId: 'port'
			});
			expect(await getGold(user.id)).toBe(initialGold + 600);
			/*
			 * 3 — port
			 *
			 * pos(port)
			 * +1 Potion d'Irma.
			 */
			await prisma.dinoz.update({
				where: {
					id: dinoz.id
				},
				data: {
					placeId: PlaceEnum.PORT_DE_PRECHE
				}
			});
			const port = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(port).toMatchObject({
				advanced: true,
				completedObjectiveId: 'port',
				currentObjectiveId: 'pub'
			});
			expect(await getItemQuantity(user.id, itemList[Item.POTION_IRMA].itemId)).toBe(1);
			/*
			 * 4 — pub
			 *
			 * scenario(intro, 2+)
			 * +1 Potion d'Irma.
			 */
			await setIntroProgression(user.id, 2);
			const pub = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(pub).toMatchObject({
				advanced: true,
				completedObjectiveId: 'pub',
				currentObjectiveId: 'baobob'
			});
			expect(await getItemQuantity(user.id, itemList[Item.POTION_IRMA].itemId)).toBe(2);
			/*
			 * 5 — baobob
			 *
			 * scenario(intro, 6+)
			 * +1 Potion d'Irma.
			 */
			await setIntroProgression(user.id, 6);
			const baobob = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(baobob).toMatchObject({
				advanced: true,
				completedObjectiveId: 'baobob',
				currentObjectiveId: 'papy'
			});
			expect(await getItemQuantity(user.id, itemList[Item.POTION_IRMA].itemId)).toBe(3);
			/*
			 * 6 — papy
			 *
			 * Une mission fish ou dog active.
			 * +1 Potion d'Ange.
			 */
			await prisma.dinozMissions.create({
				data: {
					dinozId: dinoz.id,
					missionKey: 'fish',
					progression: 0,
					tracking: 0,
					isCompleted: false
				}
			});
			const papy = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(papy).toMatchObject({
				advanced: true,
				completedObjectiveId: 'papy',
				currentObjectiveId: 'shop'
			});
			expect(await getItemQuantity(user.id, itemList[Item.POTION_ANGEL].itemId)).toBe(1);
			/*
			 * 7 — shop
			 *
			 * uvar(sbuyer, 1+)
			 * +500 or.
			 */
			await setTracking(user.id, StatTracking.S_BUYER, 1);
			const shop = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(shop).toMatchObject({
				advanced: true,
				completedObjectiveId: 'shop',
				currentObjectiveId: 'burger'
			});
			expect(await getGold(user.id)).toBe(initialGold + 1100);
			/*
			 * 8 — burger
			 *
			 * uvar(healpv, 1+)
			 * +500 or.
			 */
			await setTracking(user.id, StatTracking.HEAL_PV, 1);
			const burger = await refreshTutorialProgress({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(burger).toMatchObject({
				advanced: true,
				completedObjectiveId: 'burger',
				currentObjectiveId: 'clan'
			});
			expect(await getGold(user.id)).toBe(initialGold + 1600);
			/*
			 * 9 — clan
			 *
			 * +500 or.
			 */
			const clan = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'CLAN_PAGE_VISITED'
			});
			expect(clan).toMatchObject({
				advanced: true,
				completedObjectiveId: 'clan',
				currentObjectiveId: 'user'
			});
			expect(await getGold(user.id)).toBe(initialGold + 2100);
			/*
			 * 10 — user
			 *
			 * +500 or.
			 */
			const account = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'ACCOUNT_PAGE_VISITED'
			});
			expect(account).toMatchObject({
				advanced: true,
				completedObjectiveId: 'user',
				currentObjectiveId: 'end'
			});
			expect(await getGold(user.id)).toBe(initialGold + 2600);
			/*
			 * 11 — end
			 *
			 * +1000 or.
			 */
			const finished = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'TUTORIAL_FINISHED'
			});
			expect(finished).toMatchObject({
				active: true,
				advanced: true,
				completed: true,
				completedObjectiveId: 'end',
				currentObjectiveId: null,
				progression: TUTORIAL_COMPLETED_PROGRESSION
			});
			expect(await getTutorialProgression(user.id)).toBe(TUTORIAL_COMPLETED_PROGRESSION);
			expect(await getGold(user.id)).toBe(initialGold + 3600);
			expect(await getItemQuantity(user.id, itemList[Item.POTION_IRMA].itemId)).toBe(3);
			expect(await getItemQuantity(user.id, itemList[Item.POTION_ANGEL].itemId)).toBe(1);
			await expectCurrentObjective(user.id, null);
		});
	});

	describe('validation order', () => {
		it('ignores an event that does not match the current objective', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			const initialGold = await getGold(user.id);
			const result = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				/*
				 * Le tutoriel attend
				 * DINOZ_ADOPTED.
				 */
				event: 'CLAN_PAGE_VISITED'
			});
			expect(result).toMatchObject({
				active: true,
				advanced: false,
				completed: false,
				progression: getObjectiveProgression('dinoz'),
				currentObjectiveId: 'dinoz'
			});
			expect(await getTutorialProgression(user.id)).toBe(getObjectiveProgression('dinoz'));
			expect(await getGold(user.id)).toBe(initialGold);
		});
	});

	describe('automatic skips', () => {
		it('skips already satisfied conditional objectives without granting their rewards', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.PORT_DE_PRECHE,
				canRename: false
			});
			const initialGold = await getGold(user.id);
			/*
			 * On prépare à l'avance TOUS
			 * les objectifs conditionnels.
			 */
			await setTracking(user.id, StatTracking.MOVES, 1);
			await setTracking(user.id, StatTracking.S_BUYER, 1);
			await setTracking(user.id, StatTracking.HEAL_PV, 1);
			await setIntroProgression(user.id, 6);
			await prisma.dinozMissions.create({
				data: {
					dinozId: dinoz.id,
					missionKey: 'fish',
					isCompleted: false
				}
			});
			/*
			 * dinoz est un événement :
			 * il ne provoque pas encore le skip,
			 * car speak est aussi un événement.
			 */
			await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'DINOZ_ADOPTED'
			});
			const result = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'GUIDE_MICHEL_SPOKEN'
			});
			expect(result.advanced).toBe(true);
			expect(result.completedObjectiveId).toBe('speak');
			expect(result.skippedObjectiveIds).toEqual(['move', 'port', 'pub', 'baobob', 'papy', 'shop', 'burger']);
			expect(result.currentObjectiveId).toBe('clan');
			expect(await getTutorialProgression(user.id)).toBe(getObjectiveProgression('clan'));
			/*
			 * Seule la récompense speak
			 * doit être donnée.
			 *
			 * Les objectifs auto-skippés
			 * NE donnent rien.
			 */
			expect(await getGold(user.id)).toBe(initialGold + 100);
			expect(await getItemQuantity(user.id, itemList[Item.POTION_IRMA].itemId)).toBe(0);
			expect(await getItemQuantity(user.id, itemList[Item.POTION_ANGEL].itemId)).toBe(0);
		});
	});

	describe('concurrency', () => {
		it('validates an objective and grants its reward only once during concurrent requests', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await setTutorialProgression(user.id, getObjectiveProgression('speak'));
			const initialGold = await getGold(user.id);
			const speak = () =>
				handleTutorialEvent({
					userId: user.id,
					dinozId: dinoz.id,
					event: 'GUIDE_MICHEL_SPOKEN'
				});
			const results = await Promise.all([speak(), speak()]);
			expect(results.filter(result => result.advanced)).toHaveLength(1);
			expect(await getTutorialProgression(user.id)).toBe(getObjectiveProgression('move'));
			expect(await getGold(user.id)).toBe(initialGold + 100);
		});
	});

	describe('rollback', () => {
		it('rolls back progression and reward together when the transaction fails', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await setTutorialProgression(user.id, getObjectiveProgression('speak'));
			const initialGold = await getGold(user.id);
			await expect(
				prisma.$transaction(async tx => {
					await handleTutorialEventTx(tx, {
						userId: user.id,
						dinozId: dinoz.id,
						event: 'GUIDE_MICHEL_SPOKEN'
					});
					throw new Error('force rollback');
				})
			).rejects.toThrow('force rollback');
			expect(await getTutorialProgression(user.id)).toBe(getObjectiveProgression('speak'));
			expect(await getGold(user.id)).toBe(initialGold);
		});
	});

	describe('completed tutorial', () => {
		it('does not grant the final reward twice', async () => {
			const user = await createTestUser();
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			await setTutorialProgression(user.id, getObjectiveProgression('end'));
			const initialGold = await getGold(user.id);
			const first = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'TUTORIAL_FINISHED'
			});
			expect(first.completed).toBe(true);
			expect(first.advanced).toBe(true);
			expect(await getGold(user.id)).toBe(initialGold + 1000);
			const second = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'TUTORIAL_FINISHED'
			});
			expect(second).toMatchObject({
				active: true,
				advanced: false,
				completed: true,
				progression: TUTORIAL_COMPLETED_PROGRESSION
			});
			expect(await getGold(user.id)).toBe(initialGold + 1000);
		});
	});

	describe('accounts without tutorial', () => {
		it('ignores tutorial events when the tutorial scenario does not exist', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				canRename: false
			});
			const result = await handleTutorialEvent({
				userId: user.id,
				dinozId: dinoz.id,
				event: 'DINOZ_ADOPTED'
			});
			expect(result).toEqual({
				active: false,
				advanced: false,
				completed: false,
				progression: null,
				completedObjectiveId: null,
				currentObjectiveId: null,
				skippedObjectiveIds: []
			});
			expect(await getCurrentTutorial(user.id)).toBeNull();
		});
	});

	describe('movement restrictions', () => {
		it('blocks University during the move objective', async () => {
			const user = await createTestUser();
			await setTutorialProgression(user.id, getObjectiveProgression('move'));
			await expect(
				assertTutorialMovementAllowed({
					userId: user.id,
					fromPlace: PlaceEnum.DINOVILLE,
					toPlace: PlaceEnum.UNIVERSITE
				})
			).rejects.toMatchObject({
				code: 'tutorialMovementRestricted'
			});
		});

		it('restricts Fontaine exits during the port objective', async () => {
			const user = await createTestUser();
			await setTutorialProgression(user.id, getObjectiveProgression('port'));
			for (const blockedTarget of [PlaceEnum.DINOVILLE, PlaceEnum.PAPY_JOE, PlaceEnum.FORCEBRUT]) {
				await expect(
					assertTutorialMovementAllowed({
						userId: user.id,
						fromPlace: PlaceEnum.FOUTAINE_DE_JOUVENCE,
						toPlace: blockedTarget
					})
				).rejects.toMatchObject({
					code: 'tutorialMovementRestricted'
				});
			}
			/*
			 * Le Port reste autorisé :
			 * c'est justement l'objectif.
			 */
			await expect(
				assertTutorialMovementAllowed({
					userId: user.id,
					fromPlace: PlaceEnum.FOUTAINE_DE_JOUVENCE,
					toPlace: PlaceEnum.PORT_DE_PRECHE
				})
			).resolves.toBeUndefined();
		});

		it('does not restrict movement after tutorial completion', async () => {
			const user = await createTestUser();
			await setTutorialProgression(user.id, TUTORIAL_COMPLETED_PROGRESSION);
			await expect(
				assertTutorialMovementAllowed({
					userId: user.id,
					fromPlace: PlaceEnum.DINOVILLE,
					toPlace: PlaceEnum.UNIVERSITE
				})
			).resolves.toBeUndefined();
		});
	});
});
