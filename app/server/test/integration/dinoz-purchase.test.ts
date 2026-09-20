import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import { getRace } from '@dinorpg/core/utils/dinozUtils.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GameLogType } from '../../../prisma/index.js';
import gameConfig from '../../src/config/game.config.js';
import { getUserMaxDinoz } from '../../src/Dinoz/Controller/getActiveDinoz.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { getAvailableDinozShopRaces } from '../../src/Shop/Controller/getOrCreateDinozShop.controller.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

type DinozShopEntry = {
	id: string;
	race: number;
	display: string;
};

async function createTestShopDinoz(userId: string, raceId = RaceEnum.MOUEFFE) {
	const race = raceList[raceId];
	return prisma.userDinozShop.create({
		data: {
			userId,
			raceId,
			display: `${race.swfLetter}00000000000000`
		}
	});
}

async function createActiveDinoz(userId: string, quantity: number) {
	for (let index = 0; index < quantity; index++) {
		await createTestDinoz({
			userId
		});
	}
}

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

describe('Dinoz shop purchases', () => {
	it('atomically buys a Dinoz and initializes all related state', async () => {
		const user = await createTestUser({
			name: 'DinozBuyer'
		});
		const race = raceList[RaceEnum.MOUEFFE];
		const selectedShopDinoz = await createTestShopDinoz(user.id, race.raceId);
		/*
		 * Another shop candidate must also disappear
		 * after a successful purchase.
		 */
		await createTestShopDinoz(user.id, RaceEnum.PIGMOU);
		const initialGold = race.price + 500;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		const rankingBefore = await prisma.ranking.findUniqueOrThrow({
			where: {
				userId: user.id
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'POST',
			url: `/api/shop/dinoz/buydinoz/${selectedShopDinoz.id}`,
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(200);
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - race.price);
		const dinoz = await prisma.dinoz.findFirstOrThrow({
			where: {
				userId: user.id
			}
		});
		expect(dinoz.raceId).toBe(race.raceId);
		expect(dinoz.display).toBe(selectedShopDinoz.display);
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(0);
		const expectedBaseSkills = Object.values(skillList).filter(
			skill => skill.raceId?.includes(race.raceId) && skill.isBaseSkill
		);
		const skills = await prisma.dinozSkills.findMany({
			where: {
				dinozId: dinoz.id
			}
		});
		expect(skills).toHaveLength(expectedBaseSkills.length);
		const tracking = await prisma.userTracking.findUniqueOrThrow({
			where: {
				stat_userId: {
					stat: StatTracking.GET_DINOZ,
					userId: user.id
				}
			}
		});
		expect(tracking.quantity).toBe(1);
		const rankingAfter = await prisma.ranking.findUniqueOrThrow({
			where: {
				userId: user.id
			}
		});
		expect(rankingAfter.dinozCount).toBe(rankingBefore.dinozCount + 1);
		expect(rankingAfter.points).toBe(rankingBefore.points + 1);
		await expect
			.poll(async () => {
				return prisma.gameLog.count({
					where: {
						userId: user.id,
						type: {
							in: [GameLogType.GoldLost, GameLogType.CreateDinoz]
						}
					}
				});
			})
			.toBe(2);
	});

	it('does not modify any state when the player cannot afford the Dinoz', async () => {
		const user = await createTestUser({
			name: 'PoorDinozBuyer'
		});
		const race = raceList[RaceEnum.MOUEFFE];
		const shopDinoz = await createTestShopDinoz(user.id, race.raceId);
		const initialGold = race.price - 1;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'POST',
			url: `/api/shop/dinoz/buydinoz/${shopDinoz.id}`,
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughMoney'
		});
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold);
		expect(
			await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			})
		).toBe(0);
		/*
		 * Shop remains intact because transaction failed.
		 */
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(1);
	});

	it('prevents concurrent Dinoz purchases from buying the shop twice', async () => {
		const user = await createTestUser({
			name: 'ConcurrentDinozBuyer'
		});
		const race = raceList[RaceEnum.MOUEFFE];
		const firstShopDinoz = await createTestShopDinoz(user.id, race.raceId);
		const secondShopDinoz = await createTestShopDinoz(user.id, race.raceId);
		/*
		 * Enough Gold for TWO Dinoz.
		 *
		 * The shop claim, not the wallet,
		 * must prevent the second purchase.
		 */
		const initialGold = race.price * 2;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		const cookie = createAuthCookie(server, user);
		const [firstResponse, secondResponse] = await Promise.all([
			server.inject({
				method: 'POST',
				url: `/api/shop/dinoz/buydinoz/${firstShopDinoz.id}`,
				headers: {
					cookie
				}
			}),
			server.inject({
				method: 'POST',
				url: `/api/shop/dinoz/buydinoz/${secondShopDinoz.id}`,
				headers: {
					cookie
				}
			})
		]);
		const responses = [firstResponse, secondResponse];
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		const rejected = responses.filter(response => response.statusCode === 400);
		expect(rejected).toHaveLength(1);
		expect(rejected[0].json()).toMatchObject({
			code: 'dinozNotFound'
		});
		/*
		 * Exactly ONE Dinoz exists.
		 */
		expect(
			await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			})
		).toBe(1);
		/*
		 * Gold spent exactly once.
		 */
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - race.price);
		/*
		 * Successful purchase cleared the shop.
		 */
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(0);
	});

	it('rejects the purchase at the active Dinoz limit without debiting gold', async () => {
		const user = await createTestUser({
			name: 'FullDinozBuyer'
		});
		const maxDinoz = getUserMaxDinoz({
			leader: false,
			messie: false
		});
		await createActiveDinoz(user.id, maxDinoz);
		expect(
			await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			})
		).toBe(maxDinoz);
		const race = raceList[RaceEnum.MOUEFFE];
		const shopDinoz = await createTestShopDinoz(user.id, race.raceId);
		const initialGold = race.price + 500;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'POST',
			url: `/api/shop/dinoz/buydinoz/${shopDinoz.id}`,
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'tooManyActiveDinoz'
		});
		/*
		 * No additional Dinoz.
		 */
		expect(
			await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			})
		).toBe(maxDinoz);
		/*
		 * Critical assertion:
		 * Gold debit performed inside the transaction
		 * must have been rolled back.
		 */
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold);
		/*
		 * The shop Dinoz must still exist because
		 * the entire transaction failed.
		 */
		const shopDinozAfter = await prisma.userDinozShop.findUnique({
			where: {
				id: shopDinoz.id
			}
		});
		expect(shopDinozAfter).not.toBeNull();
		/*
		 * Failed purchase must generate no economic
		 * or Dinoz creation log.
		 */
		const logs = await prisma.gameLog.count({
			where: {
				userId: user.id,
				type: {
					in: [GameLogType.GoldLost, GameLogType.CreateDinoz]
				}
			}
		});
		expect(logs).toBe(0);
	});

	it('allows a Leader to buy beyond the normal Dinoz limit', async () => {
		const user = await createTestUser({
			name: 'LeaderDinozBuyer'
		});
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				leader: true
			}
		});
		const normalLimit = getUserMaxDinoz({
			leader: false,
			messie: false
		});
		const leaderLimit = getUserMaxDinoz({
			leader: true,
			messie: false
		});
		expect(leaderLimit).toBe(normalLimit + 3);
		/*
		 * A normal player would already be full here.
		 */
		await createActiveDinoz(user.id, normalLimit);
		const race = raceList[RaceEnum.MOUEFFE];
		const shopDinoz = await createTestShopDinoz(user.id, race.raceId);
		const initialGold = race.price + 500;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'POST',
			url: `/api/shop/dinoz/buydinoz/${shopDinoz.id}`,
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(200);
		/*
		 * The Leader may exceed the normal limit.
		 */
		expect(
			await prisma.dinoz.count({
				where: {
					userId: user.id
				}
			})
		).toBe(normalLimit + 1);
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - race.price);
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(0);
	});

	it('combines Leader and Messie Dinoz capacity bonuses', () => {
		const normalLimit = getUserMaxDinoz({
			leader: false,
			messie: false
		});
		const leaderLimit = getUserMaxDinoz({
			leader: true,
			messie: false
		});
		const messieLimit = getUserMaxDinoz({
			leader: false,
			messie: true
		});
		const combinedLimit = getUserMaxDinoz({
			leader: true,
			messie: true
		});
		expect(leaderLimit).toBe(normalLimit + 3);
		expect(messieLimit).toBe(normalLimit + 3);
		expect(combinedLimit).toBe(normalLimit + 6);
	});
});

describe('Dinoz shop lifecycle', () => {
	it('keeps the same Dinoz selection until a purchase is made', async () => {
		const user = await createTestUser({
			name: 'StableDinozShopBuyer'
		});
		const cookie = createAuthCookie(server, user);
		const firstResponse = await server.inject({
			method: 'GET',
			url: '/api/shop/dinoz',
			headers: {
				cookie
			}
		});
		expect(firstResponse.statusCode).toBe(200);
		const firstShop = firstResponse.json() as DinozShopEntry[];
		expect(firstShop).toHaveLength(gameConfig.shop.dinozNumber);
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(gameConfig.shop.dinozNumber);
		/*
		 * Opening the shop again must NOT reroll it.
		 */
		const secondResponse = await server.inject({
			method: 'GET',
			url: '/api/shop/dinoz',
			headers: {
				cookie
			}
		});
		expect(secondResponse.statusCode).toBe(200);
		const secondShop = secondResponse.json() as DinozShopEntry[];
		expect(secondShop).toEqual(firstShop);
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(gameConfig.shop.dinozNumber);
	});

	it('generates a completely new Dinoz shop after a purchase', async () => {
		const user = await createTestUser({
			name: 'RefreshingDinozShopBuyer'
		});
		const cookie = createAuthCookie(server, user);
		/*
		 * First opening generates the shop.
		 */
		const initialResponse = await server.inject({
			method: 'GET',
			url: '/api/shop/dinoz',
			headers: {
				cookie
			}
		});
		expect(initialResponse.statusCode).toBe(200);
		const initialShop = initialResponse.json() as DinozShopEntry[];
		expect(initialShop).toHaveLength(gameConfig.shop.dinozNumber);
		const selectedDinoz = initialShop[0];
		expect(selectedDinoz).toBeDefined();
		if (!selectedDinoz) {
			throw new Error('Dinoz shop is unexpectedly empty');
		}
		const selectedRace = getRace(selectedDinoz.race);
		const initialGold = selectedRace.price + 500;
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: initialGold
			}
		});
		/*
		 * Buy one candidate.
		 */
		const buyResponse = await server.inject({
			method: 'POST',
			url: `/api/shop/dinoz/buydinoz/${selectedDinoz.id}`,
			headers: {
				cookie
			}
		});
		expect(buyResponse.statusCode).toBe(200);
		/*
		 * Successful purchase clears ALL previous
		 * shop candidates.
		 */
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(0);
		/*
		 * Make sure the selected candidate became
		 * a real Dinoz belonging to the player.
		 */
		const purchasedDinoz = await prisma.dinoz.findFirstOrThrow({
			where: {
				userId: user.id,
				display: selectedDinoz.display
			}
		});
		expect(purchasedDinoz.raceId).toBe(selectedDinoz.race);
		/*
		 * Opening the shop again must generate
		 * a complete new selection.
		 */
		const refreshedResponse = await server.inject({
			method: 'GET',
			url: '/api/shop/dinoz',
			headers: {
				cookie
			}
		});
		expect(refreshedResponse.statusCode).toBe(200);
		const refreshedShop = refreshedResponse.json() as DinozShopEntry[];
		expect(refreshedShop).toHaveLength(gameConfig.shop.dinozNumber);
		expect(
			await prisma.userDinozShop.count({
				where: {
					userId: user.id
				}
			})
		).toBe(gameConfig.shop.dinozNumber);
		/*
		 * None of the old database entries may survive.
		 */
		const initialIds = new Set(initialShop.map(dinoz => dinoz.id));
		expect(refreshedShop.every(dinoz => !initialIds.has(dinoz.id))).toBe(true);
		/*
		 * Wallet charged exactly once.
		 */
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - selectedRace.price);
	});

	it('generates the Dinoz shop only once when opened concurrently', async () => {
		const user = await createTestUser({
			name: 'ConcurrentDinozShopViewer'
		});
		const cookie = createAuthCookie(server, user);
		/*
		 * Several browser requests arrive while
		 * the shop is still empty.
		 *
		 * Using more than two requests makes the
		 * concurrency scenario a little stronger.
		 */
		const responses = await Promise.all(
			Array.from({ length: 5 }, () =>
				server.inject({
					method: 'GET',
					url: '/api/shop/dinoz',
					headers: {
						cookie
					}
				})
			)
		);
		for (const response of responses) {
			expect(response.statusCode).toBe(200);
		}
		const shops = responses.map(response => response.json() as DinozShopEntry[]);
		/*
		 * Every request receives exactly one
		 * complete shop.
		 */
		for (const shop of shops) {
			expect(shop).toHaveLength(gameConfig.shop.dinozNumber);
		}
		const firstShop = shops[0];
		if (!firstShop) {
			throw new Error('Expected at least one Dinoz shop response');
		}
		/*
		 * All concurrent callers must receive
		 * the exact same persisted selection.
		 */
		for (const shop of shops.slice(1)) {
			expect(shop).toEqual(firstShop);
		}
		/*
		 * Most important assertion:
		 *
		 * 5 concurrent requests must NOT produce
		 * 5 × 30 database rows.
		 */
		const databaseShop = await prisma.userDinozShop.findMany({
			where: {
				userId: user.id
			},
			orderBy: {
				id: 'asc'
			}
		});
		expect(databaseShop).toHaveLength(gameConfig.shop.dinozNumber);
		/*
		 * Responses correspond exactly to what
		 * PostgreSQL persisted.
		 */
		expect(firstShop.map(dinoz => dinoz.id)).toEqual(databaseShop.map(dinoz => dinoz.id.toString()));
	});
});

describe('Dinoz shop race eligibility', () => {
	const getRaceIds = (rewards: readonly number[]) => getAvailableDinozShopRaces(rewards).map(race => race.raceId);
	it('only exposes the base races without rewards', () => {
		const raceIds = getRaceIds([]);
		expect(raceIds).toEqual(
			expect.arrayContaining([
				RaceEnum.WINKS,
				RaceEnum.SIRAIN,
				RaceEnum.CASTIVORE,
				RaceEnum.NUAGOZ,
				RaceEnum.GORILLOZ,
				RaceEnum.WANWAN,
				RaceEnum.PLANAILLE,
				RaceEnum.MOUEFFE,
				RaceEnum.PIGMOU
			])
		);
		expect(raceIds).toHaveLength(9);
		expect(raceIds).not.toContain(RaceEnum.ROCKY);
		expect(raceIds).not.toContain(RaceEnum.HIPPOCLAMP);
		expect(raceIds).not.toContain(RaceEnum.PTEROZ);
		expect(raceIds).not.toContain(RaceEnum.QUETZU);
	});
	it.each([
		[Reward.ROCKY, RaceEnum.ROCKY],
		[Reward.HIPPO, RaceEnum.HIPPOCLAMP],
		[Reward.PTEROZ, RaceEnum.PTEROZ],
		[Reward.QUETZU, RaceEnum.QUETZU]
	])('unlocks race %s with reward %s', (rewardId, raceId) => {
		const raceIds = getRaceIds([rewardId]);
		expect(raceIds).toContain(raceId);
		expect(raceIds).toHaveLength(10);
	});

	it('combines all Dinoz shop race rewards', () => {
		const raceIds = getRaceIds([Reward.ROCKY, Reward.HIPPO, Reward.PTEROZ, Reward.QUETZU]);
		expect(raceIds).toEqual(
			expect.arrayContaining([RaceEnum.ROCKY, RaceEnum.HIPPOCLAMP, RaceEnum.PTEROZ, RaceEnum.QUETZU])
		);
		expect(raceIds).toHaveLength(13);
	});

	it('ignores unrelated rewards', () => {
		const withoutReward = getRaceIds([]);
		const withUnrelatedReward = getRaceIds([Reward.PERLE, Reward.MERGUEZ_CARD, Reward.PAC]);
		expect(withUnrelatedReward).toEqual(withoutReward);
	});

	it('does not duplicate races when reward ids are repeated', () => {
		const raceIds = getRaceIds([Reward.ROCKY, Reward.ROCKY]);
		expect(raceIds.filter(raceId => raceId === RaceEnum.ROCKY)).toHaveLength(1);
		expect(raceIds).toHaveLength(10);
	});
});

describe('Dinoz shop display generation', () => {
	it('generates a valid display matching each Dinoz race', async () => {
		const user = await createTestUser({
			name: 'DinozDisplayViewer'
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'GET',
			url: '/api/shop/dinoz',
			headers: {
				cookie
			}
		});
		expect(response.statusCode).toBe(200);
		const shop = response.json() as DinozShopEntry[];
		expect(shop).toHaveLength(gameConfig.shop.dinozNumber);
		for (const dinoz of shop) {
			const race = getRace(dinoz.race);
			/*
			 * Complete Dinoz display:
			 *
			 * 2 race chars
			 * + 11 visual chars
			 * + palette
			 * + rare_1
			 * + rare_2
			 *
			 * = 16 chars
			 */
			expect(dinoz.display).toHaveLength(16);
			/*
			 * First two characters identify
			 * the Dinoz race.
			 */
			expect(dinoz.display.startsWith(race.swfLetter)).toBe(true);
			/*
			 * Shop-generated Dinoz currently use:
			 *
			 * palette = 0
			 * rare_1  = 0
			 * rare_2  = 0
			 */
			expect(dinoz.display.endsWith('000')).toBe(true);
			/*
			 * The 11 randomly generated visual
			 * characters must use Base62.
			 */
			const randomPart = dinoz.display.slice(2, 13);
			expect(randomPart).toMatch(/^[0-9A-Za-z]{11}$/);
		}
	});
});
