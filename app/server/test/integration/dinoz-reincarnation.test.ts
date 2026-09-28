import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { DinozStatusId } from '@dinorpg/core/models/dinoz/statusList.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import gameConfig from '../../src/config/game.config.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

const EQUIPPED_ITEM_ID = itemList[Item.POTION_IRMA].itemId;

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

async function prepareRanking(userId: string, level: number): Promise<void> {
	await prisma.ranking.update({
		where: {
			userId
		},
		data: {
			dinozCount: 1,
			points: level,
			average: level
		}
	});
}

async function addReincarnationSkill(dinozId: number): Promise<void> {
	await prisma.dinozSkills.create({
		data: {
			dinozId,
			skillId: Skill.REINCARNATION
		}
	});
}

async function equipTestItem(dinozId: number): Promise<void> {
	await prisma.dinozItems.create({
		data: {
			dinozId,
			itemId: EQUIPPED_ITEM_ID
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
		}
	});
	return wallet.amount;
}

async function getInventoryQuantity(userId: string): Promise<number> {
	const item = await prisma.userItems.findUnique({
		where: {
			itemId_userId: {
				userId,
				itemId: EQUIPPED_ITEM_ID
			}
		}
	});
	return item?.quantity ?? 0;
}

describe('Dinoz reincarnation', () => {
	it('fully resets an eligible Dinoz and cleans progression state', async () => {
		const user = await createTestUser({
			name: 'ReincarnationOwner',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		const originalSeed = '11111111-1111-4111-8111-111111111111';
		const dinoz = await createTestDinoz({
			userId: user.id,
			name: 'ReincarnatingPigmou',
			canRename: false,
			raceId: RaceEnum.PIGMOU,
			display: '1912345678901234',
			level: 40,
			experience: 1234,
			life: 77,
			maxLife: 150,
			placeId: PlaceEnum.PAPY_JOE,
			seed: originalSeed,
			nbrUpFire: 50,
			nbrUpWood: 40,
			nbrUpWater: 30,
			nbrUpLightning: 20,
			nbrUpAir: 10
		});
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				FBTournamentStep: 4
			}
		});
		await prisma.dinozSkills.createMany({
			data: [
				{
					dinozId: dinoz.id,
					skillId: Skill.REINCARNATION
				},
				{
					dinozId: dinoz.id,
					skillId: Skill.FOCUS
				}
			]
		});
		await prisma.dinozSkillsUnlockable.create({
			data: {
				dinozId: dinoz.id,
				skillId: Skill.CELERITE
			}
		});
		await prisma.dinozStatus.createMany({
			data: [
				{
					dinozId: dinoz.id,
					statusId: DinozStatusId.FSPELE
				},
				{
					dinozId: dinoz.id,
					statusId: DinozStatusId.SHOVEL
				}
			]
		});
		await prisma.dinozMissions.create({
			data: {
				dinozId: dinoz.id,
				missionKey: 'reincarnation_test',
				progression: 3,
				tracking: 2
			}
		});
		await equipTestItem(dinoz.id);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				keepSeed: false
			}
		});
		expect(response.statusCode).toBe(200);
		const reincarnated = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(reincarnated.level).toBe(1);
		expect(reincarnated.experience).toBe(0);
		expect(reincarnated.life).toBe(1);
		expect(reincarnated.maxLife).toBe(100);
		expect(reincarnated.placeId).toBe(PlaceEnum.DINOVILLE);
		expect(reincarnated.FBTournamentStep).toBe(0);
		/*
		 * Sans keepSeed, une nouvelle destinée
		 * doit être générée.
		 */
		expect(reincarnated.seed).not.toBe(originalSeed);
		/*
		 * La deuxième position du display
		 * est remise à zéro.
		 */
		expect(reincarnated.display).toBe('1012345678901234');
		/*
		 * Une réincarnation distribue cinq
		 * nouveaux points élémentaires en plus
		 * des valeurs natives de la race.
		 */
		const race = raceList[RaceEnum.PIGMOU];
		expect(
			reincarnated.nbrUpFire +
				reincarnated.nbrUpWood +
				reincarnated.nbrUpWater +
				reincarnated.nbrUpLightning +
				reincarnated.nbrUpAir
		).toBe(race.nbrFire + race.nbrWood + race.nbrWater + race.nbrLightning + race.nbrAir + 5);
		/*
		 * Toutes les anciennes compétences
		 * disparaissent et seule la compétence
		 * native du Pigmou est restaurée.
		 */
		const skills = await prisma.dinozSkills.findMany({
			where: {
				dinozId: dinoz.id
			}
		});
		expect(skills.map(skill => skill.skillId)).toEqual([Skill.CHARGE_CORNUE]);
		expect(
			await prisma.dinozSkillsUnlockable.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(0);
		expect(
			await prisma.dinozMissions.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(0);
		/*
		 * Tous les anciens statuts disparaissent
		 * et sont remplacés par REINCARNATION.
		 */
		const statuses = await prisma.dinozStatus.findMany({
			where: {
				dinozId: dinoz.id
			}
		});
		expect(statuses.map(status => status.statusId)).toEqual([DinozStatusId.REINCARNATION]);
		/*
		 * Les objets équipés reviennent dans
		 * l'inventaire du joueur.
		 */
		expect(
			await prisma.dinozItems.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(0);
		expect(await getInventoryQuantity(user.id)).toBe(1);
		/*
		 * Les points du ranking correspondant
		 * aux anciens niveaux sont retirés.
		 */
		const ranking = await prisma.ranking.findUniqueOrThrow({
			where: {
				userId: user.id
			}
		});
		expect(ranking.points).toBe(0);
		expect(ranking.average).toBe(0);
	});

	it('prevents a player from reincarnating another player Dinoz', async () => {
		const owner = await createTestUser({
			name: 'ReincarnationRealOwner',
			withTutorial: false
		});
		const attacker = await createTestUser({
			name: 'ReincarnationAttacker',
			withTutorial: false
		});
		await prepareRanking(owner.id, 40);
		await prepareRanking(attacker.id, 40);
		const dinoz = await createTestDinoz({
			userId: owner.id,
			canRename: false,
			level: 40,
			experience: 500
		});
		await addReincarnationSkill(dinoz.id);
		const originalSeed = dinoz.seed;
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, attacker)
			},
			payload: {
				keepSeed: false
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dinozDoesNotBelongToUser'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.level).toBe(40);
		expect(unchanged.experience).toBe(500);
		expect(unchanged.seed).toBe(originalSeed);
		expect(
			await prisma.dinozSkills.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(1);
	});

	it('requires the Reincarnation skill', async () => {
		const user = await createTestUser({
			name: 'MissingReincarnationSkill',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			level: 40
		});
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'reincarnationNotPossible'
		});
		expect(
			(
				await prisma.dinoz.findUniqueOrThrow({
					where: {
						id: dinoz.id
					}
				})
			).level
		).toBe(40);
	});

	it('requires level 40', async () => {
		const user = await createTestUser({
			name: 'LowLevelReincarnation',
			withTutorial: false
		});
		await prepareRanking(user.id, 39);
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			level: 39
		});
		await addReincarnationSkill(dinoz.id);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'reincarnationNotPossible'
		});
		expect(
			(
				await prisma.dinoz.findUniqueOrThrow({
					where: {
						id: dinoz.id
					}
				})
			).level
		).toBe(39);
	});

	it('prevents reincarnating again while the Reincarnation status is present', async () => {
		const user = await createTestUser({
			name: 'DoubleReincarnationOwner',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			level: 40
		});
		await addReincarnationSkill(dinoz.id);
		await prisma.dinozStatus.create({
			data: {
				dinozId: dinoz.id,
				statusId: DinozStatusId.REINCARNATION
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'reincarnationNotPossible'
		});
		expect(
			(
				await prisma.dinoz.findUniqueOrThrow({
					where: {
						id: dinoz.id
					}
				})
			).level
		).toBe(40);
	});

	it('keeps the destiny seed when keepSeed is purchased', async () => {
		const user = await createTestUser({
			name: 'KeepSeedOwner',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		const originalSeed = '22222222-2222-4222-8222-222222222222';
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			raceId: RaceEnum.PIGMOU,
			level: 40,
			seed: originalSeed
		});
		await addReincarnationSkill(dinoz.id);
		const initialGold = await getGold(user.id);
		const price = Math.round(raceList[RaceEnum.PIGMOU].price * Math.sqrt(40));
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				keepSeed: true
			}
		});
		expect(response.statusCode).toBe(200);
		const reincarnated = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(reincarnated.seed).toBe(originalSeed);
		expect(await getGold(user.id)).toBe(initialGold - price);
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			}
		});
		expect(updatedUser.keepSeedReincarnationCount).toBe(1);
	});

	it('does not mutate the Dinoz when the keepSeed quota is exhausted', async () => {
		const user = await createTestUser({
			name: 'KeepSeedQuotaOwner',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				keepSeedReincarnationCount: gameConfig.dinoz.maxKeepSeedReincarnations
			}
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			raceId: RaceEnum.PIGMOU,
			level: 40,
			experience: 500
		});
		await addReincarnationSkill(dinoz.id);
		await equipTestItem(dinoz.id);
		const initialGold = await getGold(user.id);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				keepSeed: true
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'keepSeedReincarnationLimitReached'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.level).toBe(40);
		expect(unchanged.experience).toBe(500);
		expect(
			await prisma.dinozItems.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(1);
		expect(await getInventoryQuantity(user.id)).toBe(0);
		expect(await getGold(user.id)).toBe(initialGold);
	});

	it('does not mutate equipment or quota when keepSeed cannot be afforded', async () => {
		const user = await createTestUser({
			name: 'PoorKeepSeedOwner',
			withTutorial: false
		});
		await prepareRanking(user.id, 40);
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: 0
			}
		});
		const dinoz = await createTestDinoz({
			userId: user.id,
			canRename: false,
			raceId: RaceEnum.PIGMOU,
			level: 40,
			experience: 999
		});
		await addReincarnationSkill(dinoz.id);
		await equipTestItem(dinoz.id);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/dinoz/reincarnate/${dinoz.id}`,
			headers: {
				cookie: createAuthCookie(server, user)
			},
			payload: {
				keepSeed: true
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughMoney'
		});
		const unchanged = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchanged.level).toBe(40);
		expect(unchanged.experience).toBe(999);
		expect(
			await prisma.dinozItems.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(1);
		expect(await getInventoryQuantity(user.id)).toBe(0);
		const updatedUser = await prisma.user.findUniqueOrThrow({
			where: {
				id: user.id
			}
		});
		expect(updatedUser.keepSeedReincarnationCount).toBe(0);
	});
});
