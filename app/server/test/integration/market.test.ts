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

async function createMarketTestOffer(seller: Awaited<ReturnType<typeof createTestUser>>) {
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
	const response = await server.inject({
		method: 'PUT',
		url: '/api/market',
		headers: {
			cookie: createAuthCookie(server, seller)
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
	expect(response.statusCode).toBe(200);
	return prisma.offer.findFirstOrThrow({
		where: {
			sellerId: seller.id
		}
	});
}

async function setTreasureTickets(userId: string, amount: number) {
	await prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: 'TREASURE_TICKET'
			}
		},
		data: {
			amount
		}
	});
}

async function getTreasureTickets(userId: string) {
	const wallet = await prisma.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: 'TREASURE_TICKET'
			}
		}
	});
	return wallet.amount;
}

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

describe('market bidding', () => {
	it('places a valid bid and debits treasure tickets', async () => {
		const seller = await createTestUser({
			name: 'BidSeller'
		});
		const bidder = await createTestUser({
			name: 'Bidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, 20);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			ok: true
		});
		expect(await getTreasureTickets(bidder.id)).toBe(15);
		const bid = await prisma.offerBid.findFirstOrThrow({
			where: {
				offerId: offer.id
			}
		});
		expect(bid).toMatchObject({
			userId: bidder.id,
			value: MARKET_TEST_MINIMUM_BID
		});
	});

	it('rejects a seller bidding on their own offer', async () => {
		const seller = await createTestUser({
			name: 'SelfBidSeller'
		});
		const offer = await createMarketTestOffer(seller);
		await setTreasureTickets(seller.id, 20);
		const ticketsBefore = await getTreasureTickets(seller.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'invalidOffer'
		});
		expect(await getTreasureTickets(seller.id)).toBe(ticketsBefore);
		expect(
			await prisma.offerBid.count({
				where: {
					offerId: offer.id
				}
			})
		).toBe(0);
	});

	it('rejects a bid below the minimum value', async () => {
		const seller = await createTestUser({
			name: 'MinimumBidSeller'
		});
		const bidder = await createTestUser({
			name: 'LowBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, 20);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID - 1
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'bidIsLower'
		});
		expect(await getTreasureTickets(bidder.id)).toBe(20);
		expect(
			await prisma.offerBid.count({
				where: {
					offerId: offer.id
				}
			})
		).toBe(0);
	});

	it('rejects a bid when the bidder does not have enough treasure tickets', async () => {
		const seller = await createTestUser({
			name: 'PoorBidSeller'
		});
		const bidder = await createTestUser({
			name: 'PoorBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, MARKET_TEST_MINIMUM_BID - 1);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughTickets'
		});
		expect(await getTreasureTickets(bidder.id)).toBe(MARKET_TEST_MINIMUM_BID - 1);
		expect(
			await prisma.offerBid.count({
				where: {
					offerId: offer.id
				}
			})
		).toBe(0);
	});

	it('refunds the previous highest bidder when a higher bid is placed', async () => {
		const seller = await createTestUser({
			name: 'RefundSeller'
		});
		const firstBidder = await createTestUser({
			name: 'FirstBidder'
		});
		const secondBidder = await createTestUser({
			name: 'SecondBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: firstBidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: secondBidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(firstBidder.id, 20);
		await setTreasureTickets(secondBidder.id, 20);
		const firstResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, firstBidder)
			},
			payload: {
				value: 5
			}
		});
		expect(firstResponse.statusCode).toBe(200);
		expect(await getTreasureTickets(firstBidder.id)).toBe(15);
		const secondResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, secondBidder)
			},
			payload: {
				value: 6
			}
		});
		expect(secondResponse.statusCode).toBe(200);
		/*
		 * First bidder gets the 5 tickets back.
		 */
		expect(await getTreasureTickets(firstBidder.id)).toBe(20);
		/*
		 * Second bidder has paid 6.
		 */
		expect(await getTreasureTickets(secondBidder.id)).toBe(14);
		const bids = await prisma.offerBid.findMany({
			where: {
				offerId: offer.id
			},
			orderBy: {
				value: 'asc'
			}
		});
		expect(bids).toHaveLength(2);
		expect(bids[0].value).toBe(5);
		expect(bids[1].value).toBe(6);
	});

	it('prevents two identical concurrent bids from both becoming valid', async () => {
		const seller = await createTestUser({
			name: 'ConcurrentBidSeller'
		});
		const firstBidder = await createTestUser({
			name: 'ConcurrentBidderA'
		});
		const secondBidder = await createTestUser({
			name: 'ConcurrentBidderB'
		});
		const offer = await createMarketTestOffer(seller);
		for (const bidder of [firstBidder, secondBidder]) {
			await createTestDinoz({
				userId: bidder.id,
				placeId: PlaceEnum.PLACE_DU_MARCHE
			});

			await setTreasureTickets(bidder.id, 20);
		}
		const bid = (bidder: typeof firstBidder) =>
			server.inject({
				method: 'POST',
				url: `/api/market/${offer.id}/bid`,
				headers: {
					cookie: createAuthCookie(server, bidder)
				},
				payload: {
					value: MARKET_TEST_MINIMUM_BID
				}
			});

		const [firstResponse, secondResponse] = await Promise.all([bid(firstBidder), bid(secondBidder)]);
		const responses = [firstResponse, secondResponse];
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
		const rejectedResponse = responses.find(response => response.statusCode === 400);
		expect(rejectedResponse?.json()).toMatchObject({
			code: 'bidIsLower'
		});
		const bids = await prisma.offerBid.findMany({
			where: {
				offerId: offer.id
			}
		});
		expect(bids).toHaveLength(1);
		expect(bids[0].value).toBe(MARKET_TEST_MINIMUM_BID);
		const winnerId = bids[0].userId;
		expect(winnerId).not.toBeNull();
		const firstTickets = await getTreasureTickets(firstBidder.id);
		const secondTickets = await getTreasureTickets(secondBidder.id);
		if (winnerId === firstBidder.id) {
			expect(firstTickets).toBe(15);
			expect(secondTickets).toBe(20);
		} else {
			expect(firstTickets).toBe(20);
			expect(secondTickets).toBe(15);
		}
	});
});
