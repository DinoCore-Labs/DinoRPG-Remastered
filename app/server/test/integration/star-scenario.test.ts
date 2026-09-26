import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import {
	STAR_MAGIC_STAR_COUNT,
	STAR_SCENARIO_KEY,
	STAR_SCENARIO_STEPS
} from '@dinorpg/core/models/scenarios/data/starScenario.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { digWithDinoz } from '../../src/Dinoz/Service/dig.service.js';
import { prisma } from '../../src/prisma.js';
import {
	advanceStarScenarioOnNaturalResurrectTx,
	advanceStarScenarioWithRewardTx
} from '../../src/Scenario/Controller/starScenario.controller.js';
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

async function createStarScenario(
	userId: string,
	progression: number,
	options: {
		tracking?: number;
		state?: object;
	} = {}
) {
	return prisma.userScenario.create({
		data: {
			userId,
			scenarioKey: STAR_SCENARIO_KEY,
			progression,
			tracking: options.tracking ?? 0,
			...(options.state
				? {
						state: options.state
					}
				: {})
		}
	});
}

async function setStarProgression(userId: string, progression: number) {
	return prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				scenarioKey: STAR_SCENARIO_KEY,
				userId
			}
		},
		create: {
			userId,
			scenarioKey: STAR_SCENARIO_KEY,
			progression
		},
		update: {
			progression
		}
	});
}

async function getStarScenario(userId: string) {
	return prisma.userScenario.findUniqueOrThrow({
		where: {
			scenarioKey_userId: {
				scenarioKey: STAR_SCENARIO_KEY,
				userId
			}
		}
	});
}

async function getStarProgression(userId: string) {
	return (await getStarScenario(userId)).progression;
}

async function getItemQuantity(userId: string, itemId: number) {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId
			}
		}
	});
	return item?.quantity ?? 0;
}

async function getMagicStarQuantity(userId: string) {
	return getItemQuantity(userId, Item.MAGIC_STAR);
}

async function giveItem(userId: string, itemId: number, quantity = 1) {
	await prisma.userItems.upsert({
		where: {
			itemId_userId: {
				userId,
				itemId
			}
		},
		create: {
			userId,
			itemId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});
}

async function equipItem(user: Awaited<ReturnType<typeof createTestUser>>, dinozId: number, itemId: Item) {
	return server.inject({
		method: 'PUT',
		url: `/api/inventory/equip/${dinozId}`,
		headers: {
			cookie: createAuthCookie(server, user)
		},
		payload: {
			itemId,
			equip: true
		}
	});
}

async function completeDialog(params: { userId: string; dinozId: number; dialogId: string; links: string[] }) {
	let phase = await startDialog({
		userId: params.userId,
		dinozId: params.dinozId,
		dialogId: params.dialogId
	});
	for (const linkId of params.links) {
		phase = await selectDialogLink({
			userId: params.userId,
			dinozId: params.dinozId,
			dialogId: params.dialogId,
			phaseId: phase.phaseId,
			linkId
		});
	}
	return phase;
}

function hasDialog(dialogs: Awaited<ReturnType<typeof listAvailableDialogs>>, dialogId: string) {
	return dialogs.some(dialog => dialog.id === dialogId);
}

describe('Star scenario', () => {
	describe('atomic progression', () => {
		it('advances an expected step and grants one Magic Star', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createStarScenario(user.id, STAR_SCENARIO_STEPS.MEAT_PIE);
			const progressed = await prisma.$transaction(tx =>
				advanceStarScenarioWithRewardTx(tx, {
					userId: user.id,
					expectedProgression: STAR_SCENARIO_STEPS.MEAT_PIE,
					nextProgression: STAR_SCENARIO_STEPS.DIG
				})
			);
			expect(progressed).toBe(true);
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.DIG);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});

		it('does not progress or reward from the wrong step', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createStarScenario(user.id, STAR_SCENARIO_STEPS.MERGUEZ_SELLER);
			const progressed = await prisma.$transaction(tx =>
				advanceStarScenarioWithRewardTx(tx, {
					userId: user.id,
					expectedProgression: STAR_SCENARIO_STEPS.MEAT_PIE,
					nextProgression: STAR_SCENARIO_STEPS.DIG
				})
			);
			expect(progressed).toBe(false);
			expect(await getMagicStarQuantity(user.id)).toBe(0);
		});

		it('preserves tracking and state while progressing', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createStarScenario(user.id, STAR_SCENARIO_STEPS.MEAT_PIE, {
				tracking: 12,
				state: {
					path: 'test'
				}
			});
			await prisma.$transaction(tx =>
				advanceStarScenarioWithRewardTx(tx, {
					userId: user.id,
					expectedProgression: STAR_SCENARIO_STEPS.MEAT_PIE,
					nextProgression: STAR_SCENARIO_STEPS.DIG
				})
			);
			const scenario = await getStarScenario(user.id);
			expect(scenario.tracking).toBe(12);
			expect(scenario.state).toEqual({
				path: 'test'
			});
		});

		it('grants only one Magic Star during concurrent progression', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createStarScenario(user.id, STAR_SCENARIO_STEPS.MEAT_PIE);
			const advance = () =>
				prisma.$transaction(tx =>
					advanceStarScenarioWithRewardTx(tx, {
						userId: user.id,
						expectedProgression: STAR_SCENARIO_STEPS.MEAT_PIE,
						nextProgression: STAR_SCENARIO_STEPS.DIG
					})
				);
			const results = await Promise.all([advance(), advance()]);
			expect(results.filter(Boolean)).toHaveLength(1);
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.DIG);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});

		it('rolls back progression and Magic Star together', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await createStarScenario(user.id, STAR_SCENARIO_STEPS.MEAT_PIE);
			await expect(
				prisma.$transaction(async tx => {
					await advanceStarScenarioWithRewardTx(tx, {
						userId: user.id,
						expectedProgression: STAR_SCENARIO_STEPS.MEAT_PIE,
						nextProgression: STAR_SCENARIO_STEPS.DIG
					});
					throw new Error('force rollback');
				})
			).rejects.toThrow('force rollback');
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.MEAT_PIE);
			expect(await getMagicStarQuantity(user.id)).toBe(0);
		});
	});

	describe('intro', () => {
		it('unlocks the Star scenario after 30 player days', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE
			});
			await prisma.userTracking.create({
				data: {
					userId: user.id,
					stat: StatTracking.P_DAYS,
					quantity: 29
				}
			});
			let dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'starquest_intro')).toBe(false);
			await prisma.userTracking.update({
				where: {
					stat_userId: {
						stat: StatTracking.P_DAYS,
						userId: user.id
					}
				},
				data: {
					quantity: 30
				}
			});
			dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'starquest_intro')).toBe(true);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_intro',
				links: ['yes', 'nothing', 'dom', 'star', 'how', 'ah']
			});
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.MEGAWOLF);
		});
	});

	describe('equipment-driven steps', () => {
		it('equipping Cloud Burger at Ruines Ashpouk unlocks the Merguez seller', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.RUINES_ASHPOUK
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.MERGUEZ_SELLER);
			await giveItem(user.id, Item.CLOUD_BURGER);
			const response = await equipItem(user, dinoz.id, Item.CLOUD_BURGER);
			expect(response.statusCode).toBe(200);
			expect(response.json().refreshDinoz).toBe(true);
			const dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'starquest_merguez_seller')).toBe(true);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_merguez_seller',
				links: ['ok', 'star']
			});
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.MEAT_PIE);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});

		it('does not trigger Star refresh when Cloud Burger is equipped at the wrong place', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.DINOVILLE
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.MERGUEZ_SELLER);
			await giveItem(user.id, Item.CLOUD_BURGER);
			const response = await equipItem(user, dinoz.id, Item.CLOUD_BURGER);
			expect(response.statusCode).toBe(200);
			expect(response.json().refreshDinoz).toBe(false);
		});

		it('equipping Little Pepper at the cemetery unlocks Skully', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.CIMETIERE
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.SKULLY);
			await giveItem(user.id, Item.LITTLE_PEPPER);
			const response = await equipItem(user, dinoz.id, Item.LITTLE_PEPPER);
			expect(response.statusCode).toBe(200);
			expect(response.json().refreshDinoz).toBe(true);
			const dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'starquest_skully')).toBe(true);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_skully',
				links: ['ok', 'star']
			});
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.BAO_BOB);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});
	});

	describe('dig step', () => {
		it('finds the fourth star at Tunnel sous la Branche', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.TUNNEL_SOUS_LA_BRANCHE
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.DIG);
			await prisma.dinozStatus.create({
				data: {
					dinozId: dinoz.id,
					statusId: DinozStatusId.SHOVEL
				}
			});
			const result = await digWithDinoz(user.id, dinoz.id);
			expect(result.treasureId).toBe('fourth_star');
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.SKULLY);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});
	});

	describe('Bao Bob', () => {
		it.each([5, 6, 7])('shows Bao Bob at %s:00', async hour => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.BAO_BOB
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.BAO_BOB);
			const dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id,
				now: new Date(2026, 8, 22, hour, 30)
			});
			expect(hasDialog(dialogs, 'starquest_bao_bob')).toBe(true);
		});

		it.each([4, 8, 12, 23])('hides Bao Bob at %s:00 for a normal player', async hour => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.BAO_BOB
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.BAO_BOB);
			const dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id,
				now: new Date(2026, 8, 22, hour, 30)
			});
			expect(hasDialog(dialogs, 'starquest_bao_bob')).toBe(false);
		});

		it('allows admin access to Bao Bob outside normal hours', async () => {
			const user = await createTestUser({
				withTutorial: false,
				role: 'ADMIN'
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.BAO_BOB
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.BAO_BOB);
			const dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id,
				now: new Date(2026, 8, 22, 14, 0)
			});
			expect(hasDialog(dialogs, 'starquest_bao_bob')).toBe(true);
		});

		it('advances Bao Bob to the natural resurrection step', async () => {
			const user = await createTestUser({
				withTutorial: false,
				role: 'ADMIN'
			});
			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.BAO_BOB
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.BAO_BOB);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_bao_bob',
				links: ['ok', 'star']
			});
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.NATURAL_RESURRECT);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});
	});

	describe('natural resurrection', () => {
		it('finds the seventh star after dying in Jungle Sauvage', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.NATURAL_RESURRECT);
			const progressed = await prisma.$transaction(tx =>
				advanceStarScenarioOnNaturalResurrectTx(tx, {
					userId: user.id,
					deathPlaceId: PlaceEnum.JUNGLE_SAUVAGE,
					resurrectPlaceId: PlaceEnum.DINOVILLE
				})
			);
			expect(progressed).toBe(true);
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.FINAL);
			expect(await getMagicStarQuantity(user.id)).toBe(1);
		});

		it('does not progress from another death place', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.NATURAL_RESURRECT);
			const progressed = await prisma.$transaction(tx =>
				advanceStarScenarioOnNaturalResurrectTx(tx, {
					userId: user.id,
					deathPlaceId: PlaceEnum.DINOVILLE,
					resurrectPlaceId: PlaceEnum.DINOVILLE
				})
			);
			expect(progressed).toBe(false);
			expect(await getMagicStarQuantity(user.id)).toBe(0);
		});
	});

	describe('final reward', () => {
		it('exchanges seven Magic Stars and completes Star', async () => {
			const user = await createTestUser({
				withTutorial: false
			});

			const dinoz = await createTestDinoz({
				userId: user.id,
				placeId: PlaceEnum.FOUTAINE_DE_JOUVENCE
			});
			await setStarProgression(user.id, STAR_SCENARIO_STEPS.FINAL);
			await giveItem(user.id, Item.MAGIC_STAR, STAR_MAGIC_STAR_COUNT);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'starquest_final',
				links: ['ok', 'give']
			});
			expect(await getStarProgression(user.id)).toBe(STAR_SCENARIO_STEPS.COMPLETED);
			expect(await getMagicStarQuantity(user.id)).toBe(0);
			expect(await getItemQuantity(user.id, Item.GOLDEN_NAPODINO)).toBe(1);
			const plume = await prisma.userRewards.findUnique({
				where: {
					rewardId_userId: {
						rewardId: rewardIdByKey.plume,
						userId: user.id
					}
				}
			});
			expect(plume).not.toBeNull();
		});
	});
});
