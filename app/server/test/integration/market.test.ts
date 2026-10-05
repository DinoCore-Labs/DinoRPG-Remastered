import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { MARKET_EXPIRATION_JOB_KEY, MARKET_OFFER_DURATION_MS } from '@dinorpg/core/models/market/constants.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

const MARKET_TEST_ITEM = Item.PAMPLEBOUM;
const MARKET_TEST_TOTAL = 5000;
const MARKET_TEST_MINIMUM_BID = 5;

beforeAll(async () => {
	server = await buildServer({
		startBackgroundJobs: false
	});
	await server.ready();
});

beforeEach(async () => {
	await cleanDatabase();
	await prisma.jobDefinition.create({
		data: {
			key: MARKET_EXPIRATION_JOB_KEY,
			name: 'Expire market offers',
			type: 'INTERVAL',
			timezone: 'UTC',
			intervalMs: null,
			nextRunAt: null,
			lockTimeoutS: 30,
			enabled: true
		}
	});
});

afterAll(async () => {
	await server.close();
});

describe('market auction duration', () => {
	it('creates a market offer with a fixed duration of 72 hours', async () => {
		const user = await createTestUser({
			name: 'MarketSeller'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 1
			}
		});
		const cookie = createAuthCookie(server, user);
		const beforeCreation = Date.now();
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 1
					}
				],
				ingredients: []
			}
		});
		const afterCreation = Date.now();
		expect(response.statusCode).toBe(200);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: user.id
			}
		});
		const minimumExpectedEndDate = beforeCreation + MARKET_OFFER_DURATION_MS;
		const maximumExpectedEndDate = afterCreation + MARKET_OFFER_DURATION_MS;
		expect(offer.endDate.getTime()).toBeGreaterThanOrEqual(minimumExpectedEndDate);
		expect(offer.endDate.getTime()).toBeLessThanOrEqual(maximumExpectedEndDate);
		expect(MARKET_OFFER_DURATION_MS).toBe(72 * 60 * 60 * 1000);
	});

	it('does not extend the end date when a bid is placed just before expiration', async () => {
		const seller = await createTestUser({
			name: 'MarketSeller'
		});
		const bidder = await createTestUser({
			name: 'MarketBidder'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 1
			}
		});
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: bidder.id,
					type: 'TREASURE_TICKET'
				}
			},
			data: {
				amount: 100
			}
		});
		const sellerCookie = createAuthCookie(server, seller);
		const creationResponse = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: sellerCookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 1
					}
				],
				ingredients: []
			}
		});
		expect(creationResponse.statusCode).toBe(200);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		const originalEndDate = new Date(Date.now() + 1_000);
		await prisma.offer.update({
			where: {
				id: offer.id
			},
			data: {
				endDate: originalEndDate
			}
		});
		const bidderCookie = createAuthCookie(server, bidder);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: bidderCookie
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		const offerAfterBid = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(offerAfterBid.endDate.getTime()).toBe(originalEndDate.getTime());
	});
});

describe('market offer creation', () => {
	it('creates a valid offer and removes the sold quantity from inventory', async () => {
		const seller = await createTestUser({
			name: 'MarketInventorySeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 3
			}
		});
		const cookie = createAuthCookie(server, seller);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 2
					}
				],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(200);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			},
			include: {
				items: true
			}
		});
		expect(offer.total).toBe(MARKET_TEST_TOTAL);
		expect(offer.items).toHaveLength(1);
		expect(offer.items[0]).toMatchObject({
			itemId: MARKET_TEST_ITEM,
			quantity: 2,
			isIngredient: false
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventory.quantity).toBe(1);
	});

	it('rejects an offer when the seller does not own the item', async () => {
		const seller = await createTestUser({
			name: 'MarketMissingItemSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const cookie = createAuthCookie(server, seller);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 1
					}
				],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughItems'
		});
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('rejects an offer when the seller does not own enough quantity', async () => {
		const seller = await createTestUser({
			name: 'MarketInsufficientItemSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 1
			}
		});
		const cookie = createAuthCookie(server, seller);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 2
					}
				],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughItems'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventory.quantity).toBe(1);
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('removes the inventory row when the full quantity is put on sale', async () => {
		const seller = await createTestUser({
			name: 'MarketFullQuantitySeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 2
			}
		});
		const cookie = createAuthCookie(server, seller);
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [
					{
						itemId: MARKET_TEST_ITEM,
						quantity: 2
					}
				],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(200);
		const inventory = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventory).toBeNull();
	});

	it('prevents two concurrent offer creations for the same seller', async () => {
		const seller = await createTestUser({
			name: 'ConcurrentMarketSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		/*
		 * Enough inventory for TWO offers.
		 *
		 * Inventory must therefore not be what prevents
		 * the second request from succeeding.
		 */
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 2
			}
		});
		const cookie = createAuthCookie(server, seller);
		const createOffer = () =>
			server.inject({
				method: 'PUT',
				url: '/api/market',
				headers: {
					cookie
				},
				payload: {
					total: MARKET_TEST_TOTAL,
					items: [
						{
							itemId: MARKET_TEST_ITEM,
							quantity: 1
						}
					],
					ingredients: []
				}
			});
		const [firstResponse, secondResponse] = await Promise.all([createOffer(), createOffer()]);
		const responses = [firstResponse, secondResponse];
		const successfulResponses = responses.filter(response => response.statusCode === 200);
		const rejectedResponses = responses.filter(response => response.statusCode === 400);
		expect(successfulResponses).toHaveLength(1);
		expect(rejectedResponses).toHaveLength(1);
		expect(rejectedResponses[0].json()).toMatchObject({
			code: 'alreadyOffer'
		});
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(1);
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventory.quantity).toBe(1);
		const offerItems = await prisma.offerItem.findMany({
			where: {
				offer: {
					sellerId: seller.id
				}
			}
		});
		expect(offerItems).toHaveLength(1);
		expect(offerItems[0].quantity).toBe(1);
	});
});
