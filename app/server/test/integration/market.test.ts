import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient, ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import {
	MARKET_EXPIRATION_JOB_KEY,
	MARKET_MIN_VALUE,
	MARKET_OFFER_DURATION_MS
} from '@dinorpg/core/models/market/constants.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DinozState, OfferStatus } from '../../../prisma/index.js';
import gameConfig from '../../src/config/game.config.js';
import { expireDueMarketOffersJob } from '../../src/jobs/handlers/expireMarketOffers.js';
import {
	expireDueMarketOffers,
	expireMarketOffer,
	getNextMarketOfferExpirationDate,
	scheduleNextMarketOfferExpiration
} from '../../src/Market/Service/expireMarketOffers.service.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

const MARKET_TEST_ITEM = Item.PAMPLEBOUM;
const MARKET_TEST_TOTAL = MARKET_MIN_VALUE;
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

async function createListedOffer(input: {
	sellerId: string;
	sellerName: string;
	endDate: Date;
	status?: OfferStatus;
	dinozId?: number | null;
	withItem?: boolean;
}) {
	const offer = await prisma.offer.create({
		data: {
			sellerId: input.sellerId,
			sellerName: input.sellerName,
			endDate: input.endDate,
			dinozId: input.dinozId ?? null,
			total: MARKET_TEST_TOTAL,
			status: input.status ?? OfferStatus.ONGOING
		}
	});
	if (input.withItem) {
		await prisma.offerItem.create({
			data: {
				offerId: offer.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 1,
				isIngredient: false
			}
		});
	}
	return offer;
}

async function createListedBid(input: { offerId: number; userId: string; userName: string; value: number }) {
	return prisma.offerBid.create({
		data: {
			offerId: input.offerId,
			userId: input.userId,
			userName: input.userName,
			value: input.value
		}
	});
}

async function createDinozMarketOffer(seller: Awaited<ReturnType<typeof createTestUser>>, dinozId: number) {
	const response = await server.inject({
		method: 'PUT',
		url: '/api/market',
		headers: {
			cookie: createAuthCookie(server, seller)
		},
		payload: {
			dinozId,
			total: MARKET_TEST_TOTAL,
			items: [],
			ingredients: []
		}
	});
	expect(response.statusCode).toBe(200);
	return prisma.offer.findFirstOrThrow({
		where: {
			sellerId: seller.id,
			status: OfferStatus.ONGOING
		}
	});
}

async function bidOnTestOffer(
	bidder: Awaited<ReturnType<typeof createTestUser>>,
	offerId: number,
	value = MARKET_TEST_MINIMUM_BID
) {
	await setTreasureTickets(bidder.id, 100);
	const response = await server.inject({
		method: 'POST',
		url: `/api/market/${offerId}/bid`,
		headers: {
			cookie: createAuthCookie(server, bidder)
		},
		payload: {
			value
		}
	});
	expect(response.statusCode).toBe(200);
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
				total: MARKET_MIN_VALUE - 1,
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

describe('market offer listing', () => {
	it('lists ongoing offers ordered by expiration date ascending', async () => {
		const viewer = await createTestUser({
			name: 'ListViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'ListSeller'
		});
		const lateOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 30_000),
			withItem: true
		});
		const earlyOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 10_000),
			withItem: true
		});
		const middleOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 20_000),
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/all',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(3);
		expect(body.offers.map((offer: { id: number }) => offer.id)).toEqual([earlyOffer.id, middleOffer.id, lateOffer.id]);
	});

	it('filters item offers', async () => {
		const viewer = await createTestUser({
			name: 'ItemFilterViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'ItemFilterSeller'
		});
		const itemOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 10_000),
			withItem: true
		});
		await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 20_000)
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/items',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(itemOffer.id);
	});

	it('filters Dinoz offers', async () => {
		const viewer = await createTestUser({
			name: 'DinozFilterViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'DinozFilterSeller'
		});
		const soldDinoz = await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const dinozOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 10_000),
			dinozId: soldDinoz.id
		});
		await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 20_000),
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/dinoz',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(dinozOffer.id);
	});

	it('lists offers sold by or bid on by the current user with the own filter', async () => {
		const viewer = await createTestUser({
			name: 'OwnFilterViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const otherSeller = await createTestUser({
			name: 'OwnFilterOtherSeller'
		});
		const ownOffer = await createListedOffer({
			sellerId: viewer.id,
			sellerName: viewer.name,
			endDate: new Date(Date.now() + 10_000),
			withItem: true
		});
		const bidOffer = await createListedOffer({
			sellerId: otherSeller.id,
			sellerName: otherSeller.name,
			endDate: new Date(Date.now() + 20_000),
			withItem: true
		});
		await createListedBid({
			offerId: bidOffer.id,
			userId: viewer.id,
			userName: viewer.name,
			value: MARKET_TEST_MINIMUM_BID
		});
		await createListedOffer({
			sellerId: otherSeller.id,
			sellerName: otherSeller.name,
			endDate: new Date(Date.now() + 30_000),
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/own',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(2);
		expect(body.offers.map((offer: { id: number }) => offer.id)).toEqual([ownOffer.id, bidOffer.id]);
	});

	it('filters offers by sellerId', async () => {
		const viewer = await createTestUser({
			name: 'SellerFilterViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const firstSeller = await createTestUser({
			name: 'SellerFilterA'
		});
		const secondSeller = await createTestUser({
			name: 'SellerFilterB'
		});
		const matchingOffer = await createListedOffer({
			sellerId: firstSeller.id,
			sellerName: firstSeller.name,
			endDate: new Date(Date.now() + 10_000),
			withItem: true
		});
		await createListedOffer({
			sellerId: secondSeller.id,
			sellerName: secondSeller.name,
			endDate: new Date(Date.now() + 20_000),
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?sellerId=${firstSeller.id}`,
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(matchingOffer.id);
	});

	it('filters offers by bidderId', async () => {
		const viewer = await createTestUser({
			name: 'BidderFilterViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'BidderFilterSeller'
		});
		const bidder = await createTestUser({
			name: 'BidderFilterUser'
		});
		const matchingOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 10_000),
			withItem: true
		});
		const otherOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 20_000),
			withItem: true
		});
		await createListedBid({
			offerId: matchingOffer.id,
			userId: bidder.id,
			userName: bidder.name,
			value: MARKET_TEST_MINIMUM_BID
		});
		await createListedBid({
			offerId: otherOffer.id,
			userId: viewer.id,
			userName: viewer.name,
			value: MARKET_TEST_MINIMUM_BID
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?bidderId=${bidder.id}`,
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(matchingOffer.id);
	});
});

describe('market offer listing pagination and history', () => {
	it('paginates market offers by 10', async () => {
		const viewer = await createTestUser({
			name: 'PaginationViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'PaginationSeller'
		});
		for (let index = 0; index < 12; index++) {
			await createListedOffer({
				sellerId: seller.id,
				sellerName: seller.name,
				endDate: new Date(Date.now() + (index + 1) * 10_000),
				withItem: true
			});
		}
		const firstPageResponse = await server.inject({
			method: 'GET',
			url: '/api/market/list/all?page=1',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		const secondPageResponse = await server.inject({
			method: 'GET',
			url: '/api/market/list/all?page=2',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(firstPageResponse.statusCode).toBe(200);
		expect(secondPageResponse.statusCode).toBe(200);
		const firstPage = firstPageResponse.json();
		const secondPage = secondPageResponse.json();
		expect(firstPage.total).toBe(12);
		expect(secondPage.total).toBe(12);
		expect(firstPage.offers).toHaveLength(10);
		expect(secondPage.offers).toHaveLength(2);
	});

	it('lists only ended or claimed offers when expired=true', async () => {
		const viewer = await createTestUser({
			name: 'ExpiredViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const seller = await createTestUser({
			name: 'ExpiredSeller'
		});
		await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() + 10_000),
			status: OfferStatus.ONGOING,
			withItem: true
		});
		const endedOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		const claimedOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 20_000),
			status: OfferStatus.CLAIMED,
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/all?expired=true',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(2);
		expect(body.offers.map((offer: { id: number }) => offer.id)).toEqual([claimedOffer.id, endedOffer.id]);
	});

	it('returns a total consistent with onlyMines filtering', async () => {
		const viewer = await createTestUser({
			name: 'OnlyMinesViewer'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const otherSeller = await createTestUser({
			name: 'OnlyMinesOtherSeller'
		});
		const ownOffer = await createListedOffer({
			sellerId: viewer.id,
			sellerName: viewer.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		await createListedOffer({
			sellerId: otherSeller.id,
			sellerName: otherSeller.name,
			endDate: new Date(Date.now() - 20_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: '/api/market/list/all?expired=true&onlyMines=true',
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(ownOffer.id);
	});
});

describe('market Dinoz claim and capacity guards', () => {
	it('transfers a sold Dinoz to the winning bidder', async () => {
		const seller = await createTestUser({
			name: 'DinozClaimSeller'
		});
		const winner = await createTestUser({
			name: 'DinozClaimWinner'
		});
		const soldDinoz = await createTestDinoz({
			userId: seller.id,
			name: 'SoldDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: winner.id,
			name: 'WinnerMarketDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const offer = await createDinozMarketOffer(seller, soldDinoz.id);
		await bidOnTestOffer(winner, offer.id);
		const sellerGoldBefore = await getGold(seller.id);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(response.statusCode).toBe(200);
		const transferredDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: soldDinoz.id
			}
		});
		expect(transferredDinoz.userId).toBe(winner.id);
		expect(transferredDinoz.state).toBeNull();
		expect(transferredDinoz.leaderId).toBeNull();
		expect(await getGold(seller.id)).toBe(sellerGoldBefore + MARKET_TEST_MINIMUM_BID * 1000);
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
	});

	it('keeps an unsold Dinoz with the seller after claim', async () => {
		const seller = await createTestUser({
			name: 'UnsoldDinozSeller'
		});
		const soldDinoz = await createTestDinoz({
			userId: seller.id,
			name: 'UnsoldDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const offer = await createDinozMarketOffer(seller, soldDinoz.id);
		const sellingDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: soldDinoz.id
			}
		});
		expect(sellingDinoz.state).toBe(DinozState.selling);
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
		const returnedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: soldDinoz.id
			}
		});
		expect(returnedDinoz.userId).toBe(seller.id);
		expect(returnedDinoz.state).toBeNull();
		expect(await getGold(seller.id)).toBe(sellerGoldBefore);
		const claimedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(claimedOffer.status).toBe(OfferStatus.CLAIMED);
	});

	it('rejects claiming a Dinoz when the winner is already at the Dinoz capacity limit', async () => {
		const seller = await createTestUser({
			name: 'FullDinozSeller'
		});
		const winner = await createTestUser({
			name: 'FullDinozWinner'
		});
		const soldDinoz = await createTestDinoz({
			userId: seller.id,
			name: 'CapacitySaleDinoz',
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		for (let index = 0; index < gameConfig.dinoz.maxQuantity; index++) {
			await createTestDinoz({
				userId: winner.id,
				name: `CapacityWinnerDinoz${index}`,
				placeId: index === 0 ? PlaceEnum.PLACE_DU_MARCHE : PlaceEnum.DINOVILLE
			});
		}
		const offer = await createDinozMarketOffer(seller, soldDinoz.id);
		await bidOnTestOffer(winner, offer.id);
		const sellerGoldBefore = await getGold(seller.id);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'tooMuchDinoz'
		});
		const unchangedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(unchangedOffer.status).toBe(OfferStatus.ENDED);
		const unchangedDinoz = await prisma.dinoz.findUniqueOrThrow({
			where: {
				id: soldDinoz.id
			}
		});
		expect(unchangedDinoz.userId).toBe(seller.id);
		expect(unchangedDinoz.state).toBe(DinozState.selling);
		expect(await getGold(seller.id)).toBe(sellerGoldBefore);
	});

	it('rejects claiming an item when the winner inventory is already full', async () => {
		const seller = await createTestUser({
			name: 'FullItemSeller'
		});
		const winner = await createTestUser({
			name: 'FullItemWinner'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userItems.create({
			data: {
				userId: seller.id,
				itemId: MARKET_TEST_ITEM,
				quantity: 1
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
		await bidOnTestOffer(winner, offer.id);
		await prisma.userItems.create({
			data: {
				userId: winner.id,
				itemId: MARKET_TEST_ITEM,
				quantity: itemList[MARKET_TEST_ITEM].maxQuantity
			}
		});
		const sellerGoldBefore = await getGold(seller.id);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'tooMuchItem'
		});
		const unchangedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(unchangedOffer.status).toBe(OfferStatus.ENDED);
		const winnerInventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: winner.id,
					itemId: MARKET_TEST_ITEM
				}
			}
		});
		expect(winnerInventory.quantity).toBe(itemList[MARKET_TEST_ITEM].maxQuantity);
		expect(await getGold(seller.id)).toBe(sellerGoldBefore);
	});

	it('rejects claiming an ingredient when the winner inventory is already full', async () => {
		const seller = await createTestUser({
			name: 'FullIngredientSeller'
		});
		const winner = await createTestUser({
			name: 'FullIngredientWinner'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await prisma.userIngredients.create({
			data: {
				userId: seller.id,
				ingredientId: MARKET_TEST_INGREDIENT,
				quantity: 1
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
						quantity: 1
					}
				]
			}
		});
		expect(creationResponse.statusCode).toBe(200);
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		await bidOnTestOffer(winner, offer.id);
		await prisma.userIngredients.create({
			data: {
				userId: winner.id,
				ingredientId: MARKET_TEST_INGREDIENT,
				quantity: ingredientList[MARKET_TEST_INGREDIENT].maxQuantity
			}
		});
		const sellerGoldBefore = await getGold(seller.id);
		await expireTestOffer(offer.id);
		const response = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/claim`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toMatchObject({
			code: 'tooMuchIngredient'
		});
		const unchangedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(unchangedOffer.status).toBe(OfferStatus.ENDED);
		const winnerInventory = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: winner.id,
					ingredientId: MARKET_TEST_INGREDIENT
				}
			}
		});
		expect(winnerInventory.quantity).toBe(ingredientList[MARKET_TEST_INGREDIENT].maxQuantity);
		expect(await getGold(seller.id)).toBe(sellerGoldBefore);
	});
});

describe('market concurrent operations', () => {
	it('keeps a consistent state when a bid and cancellation happen concurrently', async () => {
		const seller = await createTestUser({
			name: 'BidCancelRaceSeller'
		});
		const bidder = await createTestUser({
			name: 'BidCancelRaceBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, 20);
		const bidRequest = server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		const cancelRequest = server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		const [bidResponse, cancelResponse] = await Promise.all([bidRequest, cancelRequest]);
		const bidSucceeded = bidResponse.statusCode === 200;
		const cancelSucceeded = cancelResponse.statusCode === 200;
		/*
		 * Exactly one of the two operations must win.
		 */
		expect(Number(bidSucceeded) + Number(cancelSucceeded)).toBe(1);
		if (bidSucceeded) {
			expect(cancelResponse.statusCode).toBe(400);
			expect(cancelResponse.json()).toMatchObject({
				code: 'offerInProgress'
			});
			const existingOffer = await prisma.offer.findUniqueOrThrow({
				where: {
					id: offer.id
				}
			});
			expect(existingOffer.status).toBe(OfferStatus.ONGOING);
			expect(
				await prisma.offerBid.count({
					where: {
						offerId: offer.id
					}
				})
			).toBe(1);
			expect(await getTreasureTickets(bidder.id)).toBe(20 - MARKET_TEST_MINIMUM_BID);
			/*
			 * The item is still locked in the offer.
			 */
			const sellerInventory = await prisma.userItems.findUnique({
				where: {
					itemId_userId: {
						userId: seller.id,
						itemId: MARKET_TEST_ITEM
					}
				}
			});
			expect(sellerInventory).toBeNull();
		} else {
			expect(cancelResponse.statusCode).toBe(200);
			expect(bidResponse.statusCode).toBe(400);

			expect(bidResponse.json()).toMatchObject({
				code: 'invalidOffer'
			});
			const deletedOffer = await prisma.offer.findUnique({
				where: {
					id: offer.id
				}
			});
			expect(deletedOffer).toBeNull();
			expect(
				await prisma.offerBid.count({
					where: {
						offerId: offer.id
					}
				})
			).toBe(0);
			/*
			 * No bid was accepted, so no ticket was consumed.
			 */
			expect(await getTreasureTickets(bidder.id)).toBe(20);
			/*
			 * Cancellation restored the item exactly once.
			 */
			const sellerInventory = await prisma.userItems.findUniqueOrThrow({
				where: {
					itemId_userId: {
						userId: seller.id,
						itemId: MARKET_TEST_ITEM
					}
				}
			});
			expect(sellerInventory.quantity).toBe(1);
		}
	});

	it('does not accept a bid when expiration races on an already due offer', async () => {
		const seller = await createTestUser({
			name: 'BidExpireRaceSeller'
		});
		const bidder = await createTestUser({
			name: 'BidExpireRaceBidder'
		});
		const offer = await createMarketTestOffer(seller);
		await createTestDinoz({
			userId: bidder.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await setTreasureTickets(bidder.id, 20);
		/*
		 * Make the offer eligible for expiration.
		 */
		await prisma.offer.update({
			where: {
				id: offer.id
			},
			data: {
				endDate: new Date(Date.now() - 1_000)
			}
		});
		const bidRequest = server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, bidder)
			},
			payload: {
				value: MARKET_TEST_MINIMUM_BID
			}
		});
		const expirationRequest = expireMarketOffer(offer.id);
		const [bidResponse, expired] = await Promise.all([bidRequest, expirationRequest]);
		expect(expired).toBe(true);
		expect(bidResponse.statusCode).toBe(400);
		/*
		 * Depending on which operation observes the offer first:
		 *
		 * - bid sees the expired date -> offerEnded
		 * - expiration changes ONGOING -> ENDED first -> invalidOffer
		 *
		 * Both are valid outcomes.
		 */
		expect(['offerEnded', 'invalidOffer']).toContain(bidResponse.json().code);
		const updatedOffer = await prisma.offer.findUniqueOrThrow({
			where: {
				id: offer.id
			}
		});
		expect(updatedOffer.status).toBe(OfferStatus.ENDED);
		expect(
			await prisma.offerBid.count({
				where: {
					offerId: offer.id
				}
			})
		).toBe(0);
		/*
		 * A rejected bid must not consume tickets.
		 */
		expect(await getTreasureTickets(bidder.id)).toBe(20);
	});
});

describe('market bidding wallet invariants', () => {
	it('keeps only the highest bid locked after several bidders outbid each other', async () => {
		const seller = await createTestUser({
			name: 'TicketInvariantSeller'
		});
		const firstBidder = await createTestUser({
			name: 'TicketInvariantA'
		});
		const secondBidder = await createTestUser({
			name: 'TicketInvariantB'
		});
		const thirdBidder = await createTestUser({
			name: 'TicketInvariantC'
		});
		const offer = await createMarketTestOffer(seller);
		for (const bidder of [firstBidder, secondBidder, thirdBidder]) {
			await createTestDinoz({
				userId: bidder.id,
				placeId: PlaceEnum.PLACE_DU_MARCHE
			});

			await setTreasureTickets(bidder.id, 20);
		}
		const initialTotalTickets = 60;
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
		 * A has been fully refunded.
		 */
		expect(await getTreasureTickets(firstBidder.id)).toBe(20);
		expect(await getTreasureTickets(secondBidder.id)).toBe(14);
		const thirdResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, thirdBidder)
			},
			payload: {
				value: 7
			}
		});
		expect(thirdResponse.statusCode).toBe(200);
		/*
		 * A and B must both be fully refunded.
		 * Only C's winning bid remains locked.
		 */
		expect(await getTreasureTickets(firstBidder.id)).toBe(20);
		expect(await getTreasureTickets(secondBidder.id)).toBe(20);
		expect(await getTreasureTickets(thirdBidder.id)).toBe(13);
		const bids = await prisma.offerBid.findMany({
			where: {
				offerId: offer.id
			},
			orderBy: {
				value: 'asc'
			}
		});
		expect(bids.map(bid => bid.value)).toEqual([5, 6, 7]);
		const walletsTotal =
			(await getTreasureTickets(firstBidder.id)) +
			(await getTreasureTickets(secondBidder.id)) +
			(await getTreasureTickets(thirdBidder.id));
		/*
		 * No ticket was created or destroyed:
		 *
		 * wallets + current highest bid = initial total.
		 */
		expect(walletsTotal + 7).toBe(initialTotalTickets);
	});

	it('does not alter any wallet when a lower bid is rejected', async () => {
		const seller = await createTestUser({
			name: 'RejectedBidInvariantSeller'
		});
		const firstBidder = await createTestUser({
			name: 'RejectedBidInvariantA'
		});
		const secondBidder = await createTestUser({
			name: 'RejectedBidInvariantB'
		});
		const offer = await createMarketTestOffer(seller);
		for (const bidder of [firstBidder, secondBidder]) {
			await createTestDinoz({
				userId: bidder.id,
				placeId: PlaceEnum.PLACE_DU_MARCHE
			});
			await setTreasureTickets(bidder.id, 20);
		}
		const firstResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, firstBidder)
			},
			payload: {
				value: 7
			}
		});
		expect(firstResponse.statusCode).toBe(200);
		expect(await getTreasureTickets(firstBidder.id)).toBe(13);
		const rejectedResponse = await server.inject({
			method: 'POST',
			url: `/api/market/${offer.id}/bid`,
			headers: {
				cookie: createAuthCookie(server, secondBidder)
			},
			payload: {
				value: 6
			}
		});
		expect(rejectedResponse.statusCode).toBe(400);
		expect(rejectedResponse.json()).toMatchObject({
			code: 'bidIsLower'
		});
		/*
		 * Previous winner remains locked at 7.
		 */
		expect(await getTreasureTickets(firstBidder.id)).toBe(13);
		/*
		 * Rejected bidder keeps everything.
		 */
		expect(await getTreasureTickets(secondBidder.id)).toBe(20);
		const bids = await prisma.offerBid.findMany({
			where: {
				offerId: offer.id
			}
		});
		expect(bids).toHaveLength(1);
		expect(bids[0].value).toBe(7);
		expect((await getTreasureTickets(firstBidder.id)) + (await getTreasureTickets(secondBidder.id)) + 7).toBe(40);
	});
});

describe('market expiration scheduler', () => {
	it('schedules the expiration job when a market offer is created', async () => {
		const seller = await createTestUser({
			name: 'SchedulerCreationSeller'
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
		const offer = await prisma.offer.findFirstOrThrow({
			where: {
				sellerId: seller.id
			}
		});
		const job = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(job.nextRunAt?.getTime()).toBe(offer.endDate.getTime());
	});

	it('always schedules the earliest ongoing market offer', async () => {
		const firstSeller = await createTestUser({
			name: 'SchedulerLaterSeller'
		});
		const secondSeller = await createTestUser({
			name: 'SchedulerEarlierSeller'
		});
		const laterDate = new Date(Date.now() + 60_000);
		const earlierDate = new Date(Date.now() + 30_000);
		await createListedOffer({
			sellerId: firstSeller.id,
			sellerName: firstSeller.name,
			endDate: laterDate,
			status: OfferStatus.ONGOING
		});
		await createListedOffer({
			sellerId: secondSeller.id,
			sellerName: secondSeller.name,
			endDate: earlierDate,
			status: OfferStatus.ONGOING
		});
		const nextRunAt = await scheduleNextMarketOfferExpiration();
		expect(nextRunAt?.getTime()).toBe(earlierDate.getTime());
		const job = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(job.nextRunAt?.getTime()).toBe(earlierDate.getTime());
	});

	it('moves the scheduler to the next offer when the earliest offer is cancelled', async () => {
		const firstSeller = await createTestUser({
			name: 'SchedulerCancelFirstSeller'
		});
		const secondSeller = await createTestUser({
			name: 'SchedulerCancelSecondSeller'
		});
		await createTestDinoz({
			userId: firstSeller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const earlyOffer = await createMarketTestOffer(firstSeller);
		const laterDate = new Date(earlyOffer.endDate.getTime() + 60_000);
		await createListedOffer({
			sellerId: secondSeller.id,
			sellerName: secondSeller.name,
			endDate: laterDate,
			status: OfferStatus.ONGOING
		});
		const beforeCancel = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(beforeCancel.nextRunAt?.getTime()).toBe(earlyOffer.endDate.getTime());
		const cancelResponse = await server.inject({
			method: 'DELETE',
			url: `/api/market/${earlyOffer.id}`,
			headers: {
				cookie: createAuthCookie(server, firstSeller)
			}
		});
		expect(cancelResponse.statusCode).toBe(200);
		const afterCancel = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(afterCancel.nextRunAt?.getTime()).toBe(laterDate.getTime());
	});

	it('clears nextRunAt when the last ongoing offer is cancelled', async () => {
		const seller = await createTestUser({
			name: 'SchedulerEmptySeller'
		});
		const offer = await createMarketTestOffer(seller);
		const scheduledJob = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(scheduledJob.nextRunAt).not.toBeNull();
		const response = await server.inject({
			method: 'DELETE',
			url: `/api/market/${offer.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(response.statusCode).toBe(200);
		const job = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(job.nextRunAt).toBeNull();
		expect(await getNextMarketOfferExpirationDate()).toBeNull();
	});

	it('ignores ended and claimed offers when calculating the next expiration', async () => {
		const ongoingSeller = await createTestUser({
			name: 'SchedulerOngoingSeller'
		});
		const endedSeller = await createTestUser({
			name: 'SchedulerEndedSeller'
		});
		const claimedSeller = await createTestUser({
			name: 'SchedulerClaimedSeller'
		});
		const ongoingDate = new Date(Date.now() + 60_000);
		await createListedOffer({
			sellerId: endedSeller.id,
			sellerName: endedSeller.name,
			endDate: new Date(Date.now() + 10_000),
			status: OfferStatus.ENDED
		});
		await createListedOffer({
			sellerId: claimedSeller.id,
			sellerName: claimedSeller.name,
			endDate: new Date(Date.now() + 20_000),
			status: OfferStatus.CLAIMED
		});
		await createListedOffer({
			sellerId: ongoingSeller.id,
			sellerName: ongoingSeller.name,
			endDate: ongoingDate,
			status: OfferStatus.ONGOING
		});
		const nextRunAt = await getNextMarketOfferExpirationDate();
		expect(nextRunAt?.getTime()).toBe(ongoingDate.getTime());
		await scheduleNextMarketOfferExpiration();
		const job = await prisma.jobDefinition.findUniqueOrThrow({
			where: {
				key: MARKET_EXPIRATION_JOB_KEY
			}
		});
		expect(job.nextRunAt?.getTime()).toBe(ongoingDate.getTime());
	});

	it('returns the next future expiration after processing due offers', async () => {
		const expiredSeller = await createTestUser({
			name: 'SchedulerExpiredSeller'
		});
		const futureSeller = await createTestUser({
			name: 'SchedulerFutureSeller'
		});
		const expiredOffer = await createListedOffer({
			sellerId: expiredSeller.id,
			sellerName: expiredSeller.name,
			endDate: new Date(Date.now() - 1_000),
			status: OfferStatus.ONGOING
		});
		const futureDate = new Date(Date.now() + 60_000);
		const futureOffer = await createListedOffer({
			sellerId: futureSeller.id,
			sellerName: futureSeller.name,
			endDate: futureDate,
			status: OfferStatus.ONGOING
		});
		const result = await expireDueMarketOffersJob({
			info: () => undefined,
			error: () => undefined
		});
		expect(result.nextRunAt?.getTime()).toBe(futureDate.getTime());
		const expired = await prisma.offer.findUniqueOrThrow({
			where: {
				id: expiredOffer.id
			}
		});
		const future = await prisma.offer.findUniqueOrThrow({
			where: {
				id: futureOffer.id
			}
		});
		expect(expired.status).toBe(OfferStatus.ENDED);
		expect(future.status).toBe(OfferStatus.ONGOING);
	});
});

describe('market transaction listings', () => {
	it('does not list claimed seller offers as claimable expired sales', async () => {
		const seller = await createTestUser({
			name: 'ClaimedSellerHistory'
		});
		await createTestDinoz({
			userId: seller.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 20_000),
			status: OfferStatus.CLAIMED,
			withItem: true
		});
		const endedOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?expired=true&onlyMines=true&sellerId=${seller.id}`,
			headers: {
				cookie: createAuthCookie(server, seller)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(endedOffer.id);
	});

	it('lists only auctions actually won by the player', async () => {
		const viewer = await createTestUser({
			name: 'RealWinner'
		});
		const seller = await createTestUser({
			name: 'WinnerSeller'
		});
		const otherBidder = await createTestUser({
			name: 'HigherBidder'
		});
		await createTestDinoz({
			userId: viewer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const wonOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		await createListedBid({
			offerId: wonOffer.id,
			userId: viewer.id,
			userName: viewer.name,
			value: 15
		});
		const lostOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 20_000),
			status: OfferStatus.ENDED,
			withItem: true
		});
		await createListedBid({
			offerId: lostOffer.id,
			userId: viewer.id,
			userName: viewer.name,
			value: 10
		});
		await createListedBid({
			offerId: lostOffer.id,
			userId: otherBidder.id,
			userName: otherBidder.name,
			value: 20
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?expired=true&onlyMines=true&wonBy=${viewer.id}`,
			headers: {
				cookie: createAuthCookie(server, viewer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(wonOffer.id);
		expect(body.offers[0].bids[0].userId).toBe(viewer.id);
	});

	it('does not list an already claimed win as a claimable win', async () => {
		const winner = await createTestUser({
			name: 'AlreadyClaimedWinner'
		});
		const seller = await createTestUser({
			name: 'AlreadyClaimedSeller'
		});
		await createTestDinoz({
			userId: winner.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const offer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.CLAIMED,
			withItem: true
		});
		await createListedBid({
			offerId: offer.id,
			userId: winner.id,
			userName: winner.name,
			value: 15
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?expired=true&onlyMines=true&wonBy=${winner.id}`,
			headers: {
				cookie: createAuthCookie(server, winner)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(0);
		expect(body.offers).toEqual([]);
	});

	it('lists claimed purchases only when the player actually won them', async () => {
		const buyer = await createTestUser({
			name: 'HistoryBuyer'
		});
		const seller = await createTestUser({
			name: 'HistorySeller'
		});
		const otherBidder = await createTestUser({
			name: 'HistoryOtherBidder'
		});
		await createTestDinoz({
			userId: buyer.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const wonOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 10_000),
			status: OfferStatus.CLAIMED,
			withItem: true
		});
		await createListedBid({
			offerId: wonOffer.id,
			userId: buyer.id,
			userName: buyer.name,
			value: 20
		});
		const lostOffer = await createListedOffer({
			sellerId: seller.id,
			sellerName: seller.name,
			endDate: new Date(Date.now() - 20_000),
			status: OfferStatus.CLAIMED,
			withItem: true
		});
		await createListedBid({
			offerId: lostOffer.id,
			userId: buyer.id,
			userName: buyer.name,
			value: 10
		});
		await createListedBid({
			offerId: lostOffer.id,
			userId: otherBidder.id,
			userName: otherBidder.name,
			value: 35
		});
		const response = await server.inject({
			method: 'GET',
			url: `/api/market/list/all?expired=true&wonBy=${buyer.id}`,
			headers: {
				cookie: createAuthCookie(server, buyer)
			}
		});
		expect(response.statusCode).toBe(200);
		const body = response.json();
		expect(body.total).toBe(1);
		expect(body.offers).toHaveLength(1);
		expect(body.offers[0].id).toBe(wonOffer.id);
		expect(body.offers[0].bids[0].userId).toBe(buyer.id);
	});
});
