import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { skillList } from '@dinorpg/core/models/skills/skillList.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GameLogType } from '../../../prisma/index.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

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
});
