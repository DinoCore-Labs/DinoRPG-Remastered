import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { MARKET_EXPIRATION_JOB_KEY, MARKET_OFFER_DURATION_MS } from '@dinorpg/core/models/market/constants.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState, OfferStatus } from '../../../prisma/index.js';
import { expireDueMarketOffers, expireMarketOffer } from '../../src/Market/Service/expireMarketOffers.service.js';
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
const MARKET_TEST_INGREDIENT = Ingredient.MEROU_LUJIDANE;

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

async function getGold(userId: string) {
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

async function expireTestOffer(offerId: number) {
	await prisma.offer.update({
		where: {
			id: offerId
		},
		data: {
			endDate: new Date(Date.now() - 1_000)
		}
	});
	const expired = await expireMarketOffer(offerId);
	expect(expired).toBe(true);
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

describe('market offer cancellation', () => {
	it('allows the seller to cancel an offer without bids', async () => {
		const seller = await createTestUser({
			name: 'CancelSeller'
		});
		const offer = await createMarketTestOffer(seller);
		const response = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			ok: true
		});
		const deletedOffer = await prisma.offer.findUnique({
			where: {
				id: offer.id
			}
		});
		expect(deletedOffer).toBeNull();
	});

	it('restores the exact item quantity when an offer is cancelled', async () => {
		const seller = await createTestUser({
			name: 'CancelInventorySeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 5
			}
		});
		const creationResponse = await server.inject({
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
						quantity: 3
					}
				],
				ingredients: []
			}
		});
		expect(creationResponse.statusCode).toBe(200);
		const inventoryDuringOffer = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventoryDuringOffer.quantity).toBe(2);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		const cancelResponse = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(cancelResponse.statusCode).toBe(200);
		const inventoryAfterCancel = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventoryAfterCancel.quantity).toBe(5);
	});

	it('rejects cancellation when the offer already has a bid', async () => {
		const seller = await createTestUser({
			name: 'BidCancelSeller'
		});
		const bidder = await createTestUser({
			name: 'BidCancelBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, 20);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		const cancelResponse = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(cancelResponse.statusCode).toBe(400);
		expect(cancelResponse.json()).toMatchObject({
			code: 'offerInProgress'
		});
		const existingOffer = await prisma.offer.findUnique({
			where: {
				id: offer.id
			}
		});
		expect(existingOffer).not.toBeNull();
		expect(
			await prisma.offerBid.count({
				where: {
					offerId: offer.id
				}
			})
		).toBe(1);
	});

	it('prevents a cancelled offer from restoring its inventory twice', async () => {
		const seller = await createTestUser({
			name: 'ConcurrentCancelSeller'
		});
		const offer = await createMarketTestOffer(seller);
		const cancelOffer = () =>
			server.inject({
				method: 'DELETE',
				url: `/api/market/${offer.id}`,
				headers: {
					cookie: createAuthCookie(server, seller)
				}
			});
		const [firstResponse, secondResponse] = await Promise.all([cancelOffer(), cancelOffer()]);
		const responses = [firstResponse, secondResponse];
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
		const rejectedResponse = responses.find(response => response.statusCode === 400);
		expect(rejectedResponse?.json()).toMatchObject({
			code: 'invalidOffer'
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
});

describe('market offer expiration', () => {
	it('expires an ongoing offer when its end date has passed', async () => {
		const seller = await createTestUser({
			name: 'ExpiredOfferSeller'
		});
		const offer = await createMarketTestOffer(seller);
		await prisma.offer.update({
			where: {
				id: offer.id
			},
			data: {
				endDate: new Date(Date.now() - 1_000)
			}
		});
		const expired = await expireMarketOffer(offer.id);
		expect(expired).toBe(true);
		const updatedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(updatedOffer.status).toBe(OfferStatus.ENDED);
	});

	it('does not expire an offer whose end date is still in the future', async () => {
		const seller = await createTestUser({
			name: 'FutureOfferSeller'
		});
		const offer = await createMarketTestOffer(seller);
		const expired = await expireMarketOffer(offer.id);
		expect(expired).toBe(false);
		const unchangedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(unchangedOffer.status).toBe(OfferStatus.ONGOING);
	});

	it('processes due offers through the expiration batch', async () => {
		const firstSeller = await createTestUser({
			name: 'BatchExpiredSellerA'
		});
		const secondSeller = await createTestUser({
			name: 'BatchExpiredSellerB'
		});
		const firstOffer = await createMarketTestOffer(firstSeller);
		const secondOffer = await createMarketTestOffer(secondSeller);
		await prisma.offer.updateMany({
			where: {
				id: {
					in: [firstOffer.id, secondOffer.id]
				}
			},
			data: {
				endDate: new Date(Date.now() - 1_000)
			}
		});
		const result = await expireDueMarketOffers();
		expect(result).toEqual({
			processed: 2
		});
		const offers = await prisma.offer.findMany({
			where: {
				id: {
					in: [firstOffer.id, secondOffer.id]
				}
			}
		});
		expect(offers).toHaveLength(2);
		for (const offer of offers) {
			expect(offer.status).toBe(OfferStatus.ENDED);
		}
	});

	it('expires the same offer only once when expiration is triggered concurrently', async () => {
		const seller = await createTestUser({
			name: 'ConcurrentExpirationSeller'
		});
		const offer = await createMarketTestOffer(seller);
		await prisma.offer.update({
			where: {
				id: offer.id
			},
			data: {
				endDate: new Date(Date.now() - 1_000)
			}
		});
		const results = await Promise.all([expireMarketOffer(offer.id), expireMarketOffer(offer.id)]);
		expect(results.filter(result => result === true)).toHaveLength(1);
		expect(results.filter(result => result === false)).toHaveLength(1);
		const updatedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(updatedOffer.status).toBe(OfferStatus.ENDED);
	});
});

describe('market offer claim', () => {
	it('transfers a won offer to the winning bidder and pays the seller', async () => {
		const seller = await createTestUser({
			name: 'ClaimSeller'
		});
		const winner = await createTestUser({
			name: 'ClaimWinner'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(winner.id, 20);
		const sellerGoldBefore = await getGold(seller.id);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, winner)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		await expireTestOffer(offer.id);
		const claimResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(claimResponse.statusCode).toBe(200);
		expect(claimResponse.json()).toMatchObject({
			ok: true
		});
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
		const winnerInventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(winnerInventory.quantity).toBe(1);
		const sellerInventory = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(sellerInventory).toBeNull();
		/*
		 * One treasure ticket represents 1000 gold.
		 */
		expect(await getGold(seller.id)).toBe(sellerGoldBefore + MARKET_TEST_MINIMUM_BID * 1000);
	});

	it('returns an unsold offer to the seller without paying gold', async () => {
		const seller = await createTestUser({
			name: 'UnsoldClaimSeller'
		});
		const offer = await createMarketTestOffer(seller);
		const sellerGoldBefore = await getGold(seller.id);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			ok: true
		});
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(inventory.quantity).toBe(1);
		expect(await getGold(seller.id)).toBe(sellerGoldBefore);
	});

	it('allows the seller to claim a sold offer and still transfers the item to the winner', async () => {
		const seller = await createTestUser({
			name: 'SellerClaimSoldOffer'
		});
		const winner = await createTestUser({
			name: 'SellerClaimWinner'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(winner.id, 20);
		const sellerGoldBefore = await getGold(seller.id);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, winner)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		await expireTestOffer(offer.id);
		/*
		 * Seller triggers the claim, but the content must still
		 * go to the winning bidder.
		 */
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(response.statusCode).toBe(200);
		const winnerInventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(winnerInventory.quantity).toBe(1);
		expect(await getGold(seller.id)).toBe(sellerGoldBefore + MARKET_TEST_MINIMUM_BID * 1000);
	});

	it('rejects a claim from a player who is neither the seller nor the winner', async () => {
		const seller = await createTestUser({
			name: 'UnauthorizedClaimSeller'
		});
		const winner = await createTestUser({
			name: 'UnauthorizedClaimWinner'
		});
		const stranger = await createTestUser({
			name: 'UnauthorizedClaimStranger'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: stranger.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(winner.id, 20);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, winner)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, stranger)
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'invalidOffer'
		});
		const unchangedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(unchangedOffer.status).toBe(OfferStatus.ENDED);
		const winnerInventory = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(winnerInventory).toBeNull();
	});

	it('prevents the same unsold offer from being claimed twice', async () => {
		const seller = await createTestUser({
			name: 'DoubleClaimSeller'
		});
		const offer = await createMarketTestOffer(seller);
		await expireTestOffer(offer.id);
		const claim = () =>
			server.inject({
				method: 'POST',
				url: `/api/market/${offer.id}/claim`,
				headers: {
					cookie: createAuthCookie(server, seller)
				}
			});
		const [firstResponse, secondResponse] = await Promise.all([claim(), claim()]);
		const responses = [firstResponse, secondResponse];
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
		const rejectedResponse = responses.find(response => response.statusCode === 400);
		expect(rejectedResponse?.json()).toMatchObject({
			code: 'invalidOffer'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		/*
		 * The item must have been restored exactly once.
		 */
		expect(inventory.quantity).toBe(1);
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
	});

	it('processes a simultaneous seller and winner claim exactly once', async () => {
		const seller = await createTestUser({
			name: 'ConcurrentClaimSeller'
		});
		const winner = await createTestUser({
			name: 'ConcurrentClaimWinner'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(winner.id, 20);
		const sellerGoldBefore = await getGold(seller.id);
		const bidResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, winner)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		expect(bidResponse.statusCode).toBe(200);
		await expireTestOffer(offer.id);
		const sellerClaim = server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		const winnerClaim = server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		const [sellerResponse, winnerResponse] = await Promise.all([sellerClaim, winnerClaim]);
		const responses = [sellerResponse, winnerResponse];
		expect(responses.filter(response => response.statusCode === 200)).toHaveLength(1);
		expect(responses.filter(response => response.statusCode === 400)).toHaveLength(1);
		const rejectedResponse = responses.find(response => response.statusCode === 400);
		expect(rejectedResponse?.json()).toMatchObject({
			code: 'invalidOffer'
		});
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
		/*
		 * Winner receives the item exactly once.
		 */
		const winnerInventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(winnerInventory.quantity).toBe(1);
		/*
		 * Seller receives the gold exactly once.
		 */
		expect(await getGold(seller.id)).toBe(sellerGoldBefore + MARKET_TEST_MINIMUM_BID * 1000);
		const sellerInventory = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(sellerInventory).toBeNull();
	});
});

describe('market business validations', () => {
	it('rejects an offer below the minimum total of 5000', async () => {
		const seller = await createTestUser({
			name: 'LowTotalSeller'
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
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				total: 4999,
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
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
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

	it('rejects a non-sellable item', async () => {
		const seller = await createTestUser({
			name: 'NonSellableItemSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: Item.DAILY_TICKET,
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
						itemId: Item.DAILY_TICKET,
						quantity: 1
					}
				],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'itemNotSellable'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: seller.id,
					itemId: Item.DAILY_TICKET
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

	it('rejects offer creation when the seller has no Dinoz at the market', async () => {
		const seller = await createTestUser({
			name: 'NoMarketDinozSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.DINOVILLE
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
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'noDinozAtMarket'
		});
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('rejects an empty offer', async () => {
		const seller = await createTestUser({
			name: 'EmptyOfferSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'emptyOffer'
		});
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('rejects a second ongoing offer from the same seller', async () => {
		const seller = await createTestUser({
			name: 'SecondOfferSeller'
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
		const firstResponse = await server.inject({
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
		expect(firstResponse.statusCode).toBe(200);
		const secondResponse = await server.inject({
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
		expect(secondResponse.statusCode).toBe(400);
		expect(secondResponse.json()).toMatchObject({
			code: 'alreadyOffer'
		});
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id,
					status: OfferStatus.ONGOING
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
	});
});

describe('market ingredient offers', () => {
	it('creates an ingredient offer and removes the sold quantity from inventory', async () => {
		const seller = await createTestUser({
			name: 'IngredientSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userIngredients.create({
			data: {
				userId: seller.id,
				ingredientId: MARKET_TEST_INGREDIENT,
				quantity: 5
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
				items: [],
				ingredients: [
					{
						ingredientId: MARKET_TEST_INGREDIENT,
						quantity: 3
					}
				]
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
		expect(offer.items).toHaveLength(1);
		expect(offer.items[0]).toMatchObject({
			itemId: MARKET_TEST_INGREDIENT,
			quantity: 3,
			isIngredient: true
		});
		const inventory = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: seller.id,
					ingredientId: MARKET_TEST_INGREDIENT
				}
			}
		});
		expect(inventory.quantity).toBe(2);
	});

	it('rejects an ingredient offer when the seller does not own enough quantity', async () => {
		const seller = await createTestUser({
			name: 'PoorIngredientSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userIngredients.create({
			data: {
				userId: seller.id,
				ingredientId: MARKET_TEST_INGREDIENT,
				quantity: 2
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
				items: [],
				ingredients: [
					{
						ingredientId: MARKET_TEST_INGREDIENT,
						quantity: 3
					}
				]
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'notEnoughIngredients'
		});
		const inventory = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: seller.id,
					ingredientId: MARKET_TEST_INGREDIENT
				}
			}
		});
		expect(inventory.quantity).toBe(2);
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('restores the exact ingredient quantity when the offer is cancelled', async () => {
		const seller = await createTestUser({
			name: 'CancelIngredientSeller'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userIngredients.create({
			data: {
				userId: seller.id,
				ingredientId: MARKET_TEST_INGREDIENT,
				quantity: 5
			}
		});
		const creationResponse = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: [
					{
						ingredientId: MARKET_TEST_INGREDIENT,
						quantity: 3
					}
				]
			}
		});
		expect(creationResponse.statusCode).toBe(200);
		const duringOffer = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: seller.id,
					ingredientId: MARKET_TEST_INGREDIENT
				}
			}
		});
		expect(duringOffer.quantity).toBe(2);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		const cancelResponse = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(cancelResponse.statusCode).toBe(200);
		const afterCancel = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: seller.id,
					ingredientId: MARKET_TEST_INGREDIENT
				}
			}
		});
		expect(afterCancel.quantity).toBe(5);
	});
});

describe('market Dinoz offers', () => {
	it('creates a Dinoz offer and marks the Dinoz as selling', async () => {
		const seller = await createTestUser({
			name: 'DinozSeller'
		});
		const dinoz = await createTestDinoz({
			userId: seller.id,
			name: 'MarketDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: dinoz.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(200);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		expect(offer.dinozId).toBe(dinoz.id);
		expect(offer.status).toBe(OfferStatus.ONGOING);
		const updatedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(updatedDinoz.state).toBe(DinozState.selling);
	});

	it('restores the Dinoz state when its offer is cancelled', async () => {
		const seller = await createTestUser({
			name: 'CancelDinozSeller'
		});
		const dinoz = await createTestDinoz({
			userId: seller.id,
			name: 'CancelledMarketDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const creationResponse = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: dinoz.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(creationResponse.statusCode).toBe(200);
		const sellingDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(sellingDinoz.state).toBe(DinozState.selling);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		const cancelResponse = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(cancelResponse.statusCode).toBe(200);
		const restoredDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(restoredDinoz.state).toBeNull();
		expect(
			await prisma.offer.count({
				where: {
					id: offer.id
				}
			})
		).toBe(0);
	});

	it('rejects selling a Dinoz that is not at the market', async () => {
		const seller = await createTestUser({
			name: 'WrongPlaceDinozSeller'
		});
		/*
		 * This Dinoz gives the player access to the market.
		 */
		await createTestDinoz({
			userId: seller.id,
			name: 'MarketAccessDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		/*
		 * This is the Dinoz the player tries to sell.
		 */
		const dinoz = await createTestDinoz({
			userId: seller.id,
			name: 'DinovilleSaleDinoz',
			placeId: PlaceEnum.DINOVILLE
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: dinoz.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dinozNotAtMarket'
		});
		const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchangedDinoz.state).toBeNull();
		expect(
			await prisma.offer.count({
				where: {
					sellerId: seller.id
				}
			})
		).toBe(0);
	});

	it('rejects selling a Dinoz that belongs to a group', async () => {
		const seller = await createTestUser({
			name: 'GroupedDinozSeller'
		});
		const leader = await createTestDinoz({
			userId: seller.id,
			name: 'MarketGroupLeader',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const dinoz = await createTestDinoz({
			userId: seller.id,
			name: 'MarketGroupFollower',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.dinoz.update({
			where: {
				id: dinoz.id
			},
			data: {
				leaderId: leader.id
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: dinoz.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dinozInGroup'
		});
		const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchangedDinoz.state).toBeNull();
		expect(unchangedDinoz.leaderId).toBe(leader.id);
	});

	it('rejects selling a group leader that still has followers', async () => {
		const seller = await createTestUser({
			name: 'LeaderDinozSeller'
		});
		const leader = await createTestDinoz({
			userId: seller.id,
			name: 'SaleGroupLeader',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const follower = await createTestDinoz({
			userId: seller.id,
			name: 'SaleGroupFollower',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
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
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: leader.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'dinozInGroup'
		});
		const unchangedLeader = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: leader.id
			}
		});
		expect(unchangedLeader.state).toBeNull();
	});

	it('rejects selling a Dinoz that has equipped items', async () => {
		const seller = await createTestUser({
			name: 'EquippedDinozSeller'
		});
		const dinoz = await createTestDinoz({
			userId: seller.id,
			name: 'EquippedMarketDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.dinozItems.create({
			data: {
				dinozId: dinoz.id,
				itemId: MARKET_TEST_ITEM
			}
		});
		const response = await server.inject({
			method: 'PUT',
			url: '/api/market',
			headers: {
				cookie: createAuthCookie(server, seller)
			},
			payload: {
				dinozId: dinoz.id,
				total: MARKET_TEST_TOTAL,
				items: [],
				ingredients: []
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'equippedItems'
		});
		const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: dinoz.id
			}
		});
		expect(unchangedDinoz.state).toBeNull();
		expect(
			await prisma.dinozItems.count({
				where: {
					dinozId: dinoz.id
				}
			})
		).toBe(1);
	});
});
