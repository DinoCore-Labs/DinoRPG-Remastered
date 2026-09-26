import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import { MAGNETITE_SCENARIO_KEY, MagnetiteProgression } from '@dinorpg/core/models/scenarios/data/magnetiteScenario.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { listAvailableDialogs, selectDialogLink, startDialog } from '../../src/Dialog/Service/dialog.service.js';
import { getDinozFightDataRequest } from '../../src/Dinoz/Controller/getDinozFight.controller.js';
import { prisma } from '../../src/prisma.js';
import {
	advanceMagnetiteScenarioTx,
	processMagnetiteScenarioMoveFight
} from '../../src/Scenario/Controller/magnetiteScenario.controller.js';
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

async function setMagnetProgression(userId: string, progression: number) {
	await prisma.userScenario.upsert({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: MAGNETITE_SCENARIO_KEY
			}
		},
		create: {
			userId,
			scenarioKey: MAGNETITE_SCENARIO_KEY,
			progression
		},
		update: {
			progression
		}
	});
}

async function getMagnetProgression(userId: string) {
	const scenario = await prisma.userScenario.findUnique({
		where: {
			scenarioKey_userId: {
				userId,
				scenarioKey: MAGNETITE_SCENARIO_KEY
			}
		}
	});
	return scenario?.progression ?? 0;
}

async function createStrongDinoz(userId: string, placeId: PlaceEnum) {
	return createTestDinoz({
		userId,
		placeId,
		canRename: false,
		level: 80,
		life: 100_000,
		maxLife: 100_000,
		nbrUpFire: 1000,
		nbrUpWood: 1000,
		nbrUpWater: 1000,
		nbrUpLightning: 1000,
		nbrUpAir: 1000
	});
}

async function buildFightInput(
	userId: string,
	dinozId: number,
	fromPlace: PlaceEnum,
	triggerPlace: PlaceEnum,
	toPlace: PlaceEnum
) {
	const user = await getDinozFightDataRequest(dinozId, userId);
	if (!user) {
		throw new Error('Unable to load test user');
	}
	return {
		user,
		team: user.dinoz,
		dinozId,
		fromPlace,
		triggerPlace,
		toPlace,
		autoReequip: false
	};
}

async function moveDinozInDb(dinozId: number, placeId: PlaceEnum) {
	await prisma.dinoz.update({
		where: {
			id: dinozId
		},
		data: {
			placeId
		}
	});
}

async function addStatus(dinozId: number, statusId: number) {
	await prisma.dinozStatus.upsert({
		where: {
			statusId_dinozId: {
				dinozId,
				statusId
			}
		},
		create: {
			dinozId,
			statusId
		},
		update: {}
	});
}

async function hasStatus(dinozId: number, statusId: number) {
	return (
		(await prisma.dinozStatus.count({
			where: {
				dinozId,
				statusId
			}
		})) === 1
	);
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

describe('Magnetite scenario', () => {
	describe('atomic progression', () => {
		it('advances only once during concurrent progression', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			await setMagnetProgression(user.id, MagnetiteProgression.HUNT_DESTROYER);
			const advance = () =>
				prisma.$transaction(tx =>
					advanceMagnetiteScenarioTx(tx, {
						userId: user.id,
						expectedProgression: MagnetiteProgression.HUNT_DESTROYER,
						nextProgression: MagnetiteProgression.HUNT_NIGHTMARE
					})
				);
			const results = await Promise.all([advance(), advance()]);
			expect(results.filter(Boolean)).toHaveLength(1);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.HUNT_NIGHTMARE);
		});
	});

	describe('initial ambush', () => {
		it('starts the scenario at the Syphon and progresses to the King', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.PYLONES_DE_MAGNETITES);
			await setMagnetProgression(user.id, MagnetiteProgression.INITIAL_AMBUSH);
			const input = await buildFightInput(
				user.id,
				dinoz.id,
				PlaceEnum.PYLONES_DE_MAGNETITES,
				PlaceEnum.SYPHON_SIFFLEUR,
				PlaceEnum.SYPHON_SIFFLEUR
			);
			const result = await processMagnetiteScenarioMoveFight(input);
			if (result === false) {
				throw new Error('Expected Magnetite initial ambush');
			}
			expect(result.result).toBe(true);
			expect(result.goldEarned).toBe(0);
			expect(result.xpEarned).toBe(0);
			expect(result.monsterKillCount).toBe(0);
			expect(result.scenario).toMatchObject({
				key: MAGNETITE_SCENARIO_KEY,
				fightKey: 'magnet_initial_ambush',
				progressed: true,
				progression: MagnetiteProgression.TALK_TO_KING
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.TALK_TO_KING);
		});
	});

	describe('first King audience', () => {
		it('accepts the King mission and starts the Team W hunt', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.CITADELLE_DU_ROI);
			await setMagnetProgression(user.id, MagnetiteProgression.TALK_TO_KING);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'rocky_king_magnet1',
				links: ['enter', 'events', 'magnet', 'magnet2', 'events2', 'me', 'team', 'team2', 'accept', 'leave']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.HUNT_DESTROYER);
		});
	});

	describe('Strange Ranger', () => {
		it('marks the Strange Ranger encounter without progressing the scenario', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.SYPHON_SIFFLEUR);
			await setMagnetProgression(user.id, MagnetiteProgression.HUNT_DESTROYER);
			let dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'magnetite_strange_ranger')).toBe(true);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'magnetite_strange_ranger',
				links: ['view']
			});
			expect(await hasStatus(dinoz.id, DinozStatusId.MAGNETITE_RANGER_SEEN)).toBe(true);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.HUNT_DESTROYER);
			dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'magnetite_strange_ranger')).toBe(false);
		});
	});

	describe('Team W hunt', () => {
		it.each([
			{
				from: MagnetiteProgression.HUNT_DESTROYER,
				to: MagnetiteProgression.HUNT_NIGHTMARE,
				place: PlaceEnum.TAUDIS_DES_ZAXA,
				fightKey: 'magnet_wteam_1'
			},
			{
				from: MagnetiteProgression.HUNT_NIGHTMARE,
				to: MagnetiteProgression.HUNT_THUNDER,
				place: PlaceEnum.CAMP_DES_EMMEMMA,
				fightKey: 'magnet_wteam_2'
			},
			{
				from: MagnetiteProgression.HUNT_THUNDER,
				to: MagnetiteProgression.ENTER_TEAM_W_CAMP,
				place: PlaceEnum.CAMPEMENT_DES_MATTMUT,
				fightKey: 'magnet_wteam_3'
			}
		])('defeats $fightKey without normal combat rewards', async ({ from, to, place, fightKey }) => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.SYPHON_SIFFLEUR);
			await setMagnetProgression(user.id, from);
			const input = await buildFightInput(user.id, dinoz.id, dinoz.placeId, place, place);
			const result = await processMagnetiteScenarioMoveFight(input);
			if (result === false) {
				throw new Error(`Expected ${fightKey}`);
			}
			expect(result.result).toBe(true);
			expect(result.goldEarned).toBe(0);
			expect(result.xpEarned).toBe(0);
			expect(result.monsterKillCount).toBe(0);
			expect(result.scenario).toMatchObject({
				fightKey,
				progressed: true,
				progression: to
			});
			expect(await getMagnetProgression(user.id)).toBe(to);
		});
	});

	describe('first Groubourin encounter', () => {
		it('interrupts the fight and progresses to the Captain', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.CAMPEMENT_DES_MATTMUT);
			await setMagnetProgression(user.id, MagnetiteProgression.ENTER_TEAM_W_CAMP);
			const input = await buildFightInput(
				user.id,
				dinoz.id,
				dinoz.placeId,
				PlaceEnum.REPAIRE_DE_LA_TEAM_W,
				PlaceEnum.REPAIRE_DE_LA_TEAM_W
			);
			const result = await processMagnetiteScenarioMoveFight(input);
			if (result === false) {
				throw new Error('Expected Groubourin encounter');
			}
			expect(result.result).toBe(true);
			expect(result.goldEarned).toBe(0);
			expect(result.xpEarned).toBe(0);
			expect(result.monsterKillCount).toBe(0);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.TALK_TO_CAPTAIN);
		});
	});

	describe('Captain and King', () => {
		it('progresses 6 -> 7 -> 8 through the story dialogs', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.REPAIRE_DE_LA_TEAM_W);
			await setMagnetProgression(user.id, MagnetiteProgression.TALK_TO_CAPTAIN);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'magnetite_team_w_captain',
				links: ['who', 'tell', 'hist1', 'hist2', 'hist3', 'hist4', 'hist5', 'ask', 'yes']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.RETURN_TO_KING);
			await moveDinozInDb(dinoz.id, PlaceEnum.CITADELLE_DU_ROI);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'rocky_king_magnet7',
				links: ['next', 'talk', 'cont', 'serv', 'sehd', 'control', 'serv2', 'ingr', 'sage', 'face', 'end', 'bye']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.PREPARE_POTION);
		});
	});

	describe('Anti-Sehd potion', () => {
		it('collects the three components and creates the potion', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.MINES_DE_CORAIL);
			await setMagnetProgression(user.id, MagnetiteProgression.PREPARE_POTION);
			await addStatus(dinoz.id, DinozStatusId.BUOY);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'coral_miner',
				links: ['give']
			});
			expect(await hasStatus(dinoz.id, DinozStatusId.CORAIL)).toBe(true);
			await moveDinozInDb(dinoz.id, PlaceEnum.GORGES_PROFONDES);
			await addStatus(dinoz.id, DinozStatusId.FSPELE);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'speleleologue_ice',
				links: ['talk', 'next', 'prof', 'theo', 'ok']
			});
			expect(await hasStatus(dinoz.id, DinozStatusId.ICE_PIECE)).toBe(true);
			/*
			 * La Branche Fleurie provient de
			 * la mission du Gardien de la Forêt.
			 *
			 * Les missions étant déjà testées,
			 * on prépare directement cet état.
			 */
			await addStatus(dinoz.id, DinozStatusId.FLOWERING_BRANCH);
			await moveDinozInDb(dinoz.id, PlaceEnum.BAO_BOB);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'bao_bob',
				links: ['question', 'quest4', 'ingr', 'potion']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.POTION_READY);
			expect(await hasStatus(dinoz.id, DinozStatusId.ANTI_SEDH_POTION)).toBe(true);
			expect(await hasStatus(dinoz.id, DinozStatusId.FLOWERING_BRANCH)).toBe(false);
			expect(await hasStatus(dinoz.id, DinozStatusId.ICE_PIECE)).toBe(false);
			expect(await hasStatus(dinoz.id, DinozStatusId.CORAIL)).toBe(false);
		});
	});

	describe('Dark Goupignon ambush', () => {
		it('steals the potion and progresses 9 -> 10', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.PORTE_DE_SYLVENOIRE);
			await setMagnetProgression(user.id, MagnetiteProgression.POTION_READY);
			await addStatus(dinoz.id, DinozStatusId.ANTI_SEDH_POTION);
			const input = await buildFightInput(
				user.id,
				dinoz.id,
				dinoz.placeId,
				PlaceEnum.GO_TO_STEPPES,
				PlaceEnum.FRONTIERE_CREPITANTE
			);
			const result = await processMagnetiteScenarioMoveFight(input);
			if (result === false) {
				throw new Error('Expected Dark Goupignon ambush');
			}
			expect(result.result).toBe(true);
			expect(result.goldEarned).toBe(0);
			expect(result.xpEarned).toBe(0);
			expect(result.monsterKillCount).toBe(0);
			expect(await hasStatus(dinoz.id, DinozStatusId.ANTI_SEDH_POTION)).toBe(false);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.FINAL_ASSAULT);
		});
	});

	describe('final assault', () => {
		it('wins the final assault and progresses 10 -> 11', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.CITADELLE_DU_ROI);
			await setMagnetProgression(user.id, MagnetiteProgression.FINAL_ASSAULT);
			const response = await server.inject({
				method: 'PUT',
				url: '/api/fight/dialog',
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					dinozId: dinoz.id,
					dialogId: 'magnetite_citadel_guard_assault',
					phaseId: 'fight',
					autoReequip: false
				}
			});
			expect(response.statusCode).toBe(200);
			const body = response.json();
			expect(body.result).toBe(true);
			expect(body.scenario).toMatchObject({
				key: MAGNETITE_SCENARIO_KEY,
				fightKey: 'magnet_final_assault',
				progressed: true,
				progression: MagnetiteProgression.FINAL_ASSAULT_WON
			});
			/*
			 * 1 Goupignon initial
			 * + 1 Goupignon par Dinoz.
			 *
			 * Ici l'équipe contient 1 Dinoz.
			 */
			expect(body.monsterKillCount).toBe(2);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.FINAL_ASSAULT_WON);
		});

		it('processes only one concurrent final assault', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.CITADELLE_DU_ROI);
			await setMagnetProgression(user.id, MagnetiteProgression.FINAL_ASSAULT);
			const fight = () =>
				server.inject({
					method: 'PUT',
					url: '/api/fight/dialog',
					headers: {
						cookie: createAuthCookie(server, user)
					},
					payload: {
						dinozId: dinoz.id,
						dialogId: 'magnetite_citadel_guard_assault',
						phaseId: 'fight'
					}
				});
			const responses = await Promise.all([fight(), fight()]);
			const statuses = responses.map(response => response.statusCode).sort();
			expect(statuses).toEqual([200, 400]);
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.FINAL_ASSAULT_WON);
		});
	});

	describe('reward and epilogue', () => {
		it('requires the King reward before completing the scenario', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const dinoz = await createStrongDinoz(user.id, PlaceEnum.CITADELLE_DU_ROI);
			await setMagnetProgression(user.id, MagnetiteProgression.FINAL_ASSAULT_WON);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'magnetite_team_w_captain_debrief',
				links: ['ok', 'thanks', 'how', 'not', 'thanks2']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.CLAIM_REWARD);
			/*
			 * Avant la récompense :
			 * le Rôdeur NE DOIT PAS pouvoir
			 * terminer le scénario.
			 */
			await moveDinozInDb(dinoz.id, PlaceEnum.CONFINS_DES_STEPPES);
			let dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'magnetite_strange_ranger_epilogue')).toBe(false);
			await moveDinozInDb(dinoz.id, PlaceEnum.CITADELLE_DU_ROI);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'rocky_king_magnet12',
				links: ['not', 'not2', 'plan', 'ok', 'accept', 'thanks']
			});
			/*
			 * La récompense ne termine pas
			 * encore le scénario.
			 */
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.CLAIM_REWARD);
			const magnetReward = await prisma.userRewards.findUnique({
				where: {
					rewardId_userId: {
						userId: user.id,
						rewardId: rewardIdByKey.magnet
					}
				}
			});
			expect(magnetReward).not.toBeNull();
			expect(await getItemQuantity(user.id, Item.GOLDEN_NAPODINO)).toBe(1);
			/*
			 * Impossible de réclamer
			 * la récompense une seconde fois.
			 */
			await expect(
				startDialog({
					userId: user.id,
					dinozId: dinoz.id,
					dialogId: 'rocky_king_magnet12'
				})
			).rejects.toMatchObject({
				code: 'dialogNotAvailable'
			});
			await moveDinozInDb(dinoz.id, PlaceEnum.CONFINS_DES_STEPPES);
			dialogs = await listAvailableDialogs({
				userId: user.id,
				dinozId: dinoz.id
			});
			expect(hasDialog(dialogs, 'magnetite_strange_ranger_epilogue')).toBe(true);
			await completeDialog({
				userId: user.id,
				dinozId: dinoz.id,
				dialogId: 'magnetite_strange_ranger_epilogue',
				links: ['ask', 'euh', 'end']
			});
			expect(await getMagnetProgression(user.id)).toBe(MagnetiteProgression.COMPLETED);
		});
	});

	describe('Syphon crossing', () => {
		it('kills the group when crossing the Syphon without the Magnetite reward', async () => {
			const user = await createTestUser({
				withTutorial: false
			});
			const leader = await createStrongDinoz(user.id, PlaceEnum.SYPHON_SIFFLEUR);
			const follower = await createStrongDinoz(user.id, PlaceEnum.SYPHON_SIFFLEUR);
			await prisma.dinoz.update({
				where: {
					id: follower.id
				},
				data: {
					leaderId: leader.id
				}
			});
			const response = await server.inject({
				method: 'PUT',
				url: '/api/dinoz/move',
				headers: {
					cookie: createAuthCookie(server, user)
				},
				payload: {
					dinozId: leader.id,
					placeId: PlaceEnum.APPROCHER_SYPHON
				}
			});
			expect(response.statusCode).toBe(200);
			expect(response.json().movementEvent?.key).toBe('magnet_syphon_death');
			const [leaderAfter, followerAfter] = await Promise.all([
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: leader.id
					}
				}),
				prisma.dinoz.findUniqueOrThrow({
					where: {
						id: follower.id
					}
				})
			]);
			expect(leaderAfter.life).toBe(0);
			expect(followerAfter.life).toBe(0);
			expect(leaderAfter.placeId).toBe(PlaceEnum.SYPHON_SIFFLEUR);
			expect(followerAfter.placeId).toBe(PlaceEnum.SYPHON_SIFFLEUR);
		});
	});
});
