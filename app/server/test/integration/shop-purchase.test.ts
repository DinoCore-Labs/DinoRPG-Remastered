import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { Ingredient } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GameLogType } from '../../../prisma/index.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestDinoz } from '../helpers/factories/dinoz.factory.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

function getFlyingShopTestItem() {
	const shop = shopListV2.FLYING_SHOP;
	const item = itemList[Item.POTION_IRMA];
	const soldItem = shop.listItemsSold.find(sold => sold.id === item.itemId);
	if (!soldItem) {
		throw new Error('POTION_IRMA is expected to be sold in FLYING_SHOP');
	}
	return {
		shopId: shop.shopId,
		itemId: item.itemId,
		price: soldItem.price,
		maxQuantity: item.maxQuantity
	};
}

function getForgeShopTestItem() {
	const shop = shopListV2.FORGE_SHOP;
	const item = itemList[Item.REFRIGERATED_SHIELD];
	const soldItem = shop.listItemsSold.find(sold => sold.id === item.itemId);
	if (!soldItem) {
		throw new Error('REFRIGERATED_SHIELD is expected to be sold in FORGE_SHOP');
	}
	return {
		shopId: shop.shopId,
		itemId: item.itemId,
		price: soldItem.price
	};
}

function getMagicShopTestItem() {
	const shop = shopListV2.MAGIC_SHOP;
	const item = itemList[Item.BANISHMENT];
	const soldItem = shop.listItemsSold.find(sold => sold.id === item.itemId);
	if (!soldItem) {
		throw new Error('BANISHMENT is expected to be sold in MAGIC_SHOP');
	}
	return {
		shopId: shop.shopId,
		itemId: item.itemId,
		price: soldItem.price,
		maxQuantity: item.maxQuantity
	};
}

function getFilouTestIngredient() {
	const shop = shopListV2.FILOU;
	const ingredientId = Ingredient.MEROU_LUJIDANE;
	const soldIngredient = shop.listItemsSold.find(item => item.id === ingredientId);
	if (!soldIngredient) {
		throw new Error('MEROU_LUJIDANE is expected to be accepted by FILOU');
	}
	return {
		shopId: shop.shopId,
		ingredientId,
		exchangeRate: soldIngredient.price
	};
}

async function waitForPurchaseLogs(userId: string): Promise<void> {
	await expect
		.poll(async () => {
			return prisma.gameLog.count({
				where: {
					userId,
					type: {
						in: [GameLogType.GoldLost, GameLogType.ItemBought]
					}
				}
			});
		})
		.toBe(2);
}

async function waitForMagicPurchaseLogs(userId: string): Promise<void> {
	await expect
		.poll(async () => {
			return prisma.gameLog.count({
				where: {
					userId,
					type: {
						in: [GameLogType.ItemUsed, GameLogType.ItemBought]
					}
				}
			});
		})
		.toBe(2);
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

describe('shop purchases', () => {
	it('buys an item and debits the player gold wallet', async () => {
		const user = await createTestUser({
			name: 'ShopBuyer'
		});
		const { shopId, itemId, price } = getFlyingShopTestItem();
		const initialGold = price + 500;
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
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			itemId,
			quantity: 1,
			gold: price
		});
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - price);
		const inventoryItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem.quantity).toBe(1);
		await waitForPurchaseLogs(user.id);
	});

	it('does not buy an item when the player does not have enough gold', async () => {
		const user = await createTestUser({
			name: 'PoorShopBuyer'
		});
		const { shopId, itemId, price } = getFlyingShopTestItem();
		const initialGold = price - 1;
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
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'notEnoughMoney'
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
		const inventoryItem = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem).toBeNull();
	});

	it('allows reaching the inventory limit but rejects purchases beyond it without debiting gold', async () => {
		const user = await createTestUser({
			name: 'InventoryLimitBuyer'
		});
		const { shopId, itemId, price, maxQuantity } = getFlyingShopTestItem();
		const initialGold = price * 2 + 500;
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
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId,
				quantity: maxQuantity - 1
			}
		});
		const cookie = createAuthCookie(server, user);
		/*
		 * First purchase:
		 * maxQuantity - 1 → maxQuantity
		 */
		const allowedResponse = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(allowedResponse.statusCode).toBe(200);
		const inventoryAtMaximum = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryAtMaximum.quantity).toBe(maxQuantity);
		const walletAfterAllowedPurchase = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfterAllowedPurchase.amount).toBe(initialGold - price);
		await waitForPurchaseLogs(user.id);

		/*
		 * Second purchase:
		 * maxQuantity → maxQuantity + 1
		 *
		 * Must be rejected.
		 */
		const rejectedResponse = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(rejectedResponse.statusCode).toBe(400);
		expect(rejectedResponse.json()).toEqual({
			error: 'maxQuantityInventory'
		});
		/*
		 * Inventory must remain exactly at the maximum.
		 */
		const inventoryAfterRejectedPurchase = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryAfterRejectedPurchase.quantity).toBe(maxQuantity);
		/*
		 * Most important assertion:
		 * failed purchase must not cost anything.
		 */
		const walletAfterRejectedPurchase = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfterRejectedPurchase.amount).toBe(walletAfterAllowedPurchase.amount);
		/*
		 * Only the successful purchase should have generated
		 * GoldLost + ItemBought.
		 */
		const purchaseLogCount = await prisma.gameLog.count({
			where: {
				userId: user.id,
				type: {
					in: [GameLogType.GoldLost, GameLogType.ItemBought]
				}
			}
		});
		expect(purchaseLogCount).toBe(2);
	});

	it('prevents concurrent purchases from spending the same gold twice', async () => {
		const user = await createTestUser({
			name: 'ConcurrentShopBuyer'
		});
		const { shopId, itemId, price } = getFlyingShopTestItem();
		/*
		 * Exactly enough gold for ONE purchase.
		 */
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: price
			}
		});
		const cookie = createAuthCookie(server, user);
		const [firstResponse, secondResponse] = await Promise.all([
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId,
					quantity: 1
				}
			}),
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId,
					quantity: 1
				}
			})
		]);
		const responses = [firstResponse, secondResponse];
		const successfulResponses = responses.filter(response => response.statusCode === 200);
		const rejectedResponses = responses.filter(response => response.statusCode === 400);
		expect(successfulResponses).toHaveLength(1);
		expect(rejectedResponses).toHaveLength(1);
		expect(rejectedResponses[0].json()).toEqual({
			error: 'notEnoughMoney'
		});
		/*
		 * Gold was spent exactly once.
		 */
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(0);
		/*
		 * Item was also obtained exactly once.
		 */
		const inventoryItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem.quantity).toBe(1);
		/*
		 * Only the successful purchase generated logs.
		 */
		await expect
			.poll(async () => {
				return prisma.gameLog.count({
					where: {
						userId: user.id,
						type: {
							in: [GameLogType.GoldLost, GameLogType.ItemBought]
						}
					}
				});
			})
			.toBe(2);
	});

	it('atomically prevents concurrent purchases from exceeding the inventory limit', async () => {
		const user = await createTestUser({
			name: 'ConcurrentInventoryBuyer'
		});
		const { shopId, itemId, price, maxQuantity } = getFlyingShopTestItem();
		/*
		 * Enough Gold for TWO purchases.
		 *
		 * Gold must therefore NOT be the reason
		 * the second request fails.
		 */
		const initialGold = price * 2;
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
		 * Only ONE inventory slot remains.
		 */
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId,
				quantity: maxQuantity - 1
			}
		});
		const cookie = createAuthCookie(server, user);
		const [firstResponse, secondResponse] = await Promise.all([
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId,
					quantity: 1
				}
			}),
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId,
					quantity: 1
				}
			})
		]);
		const responses = [firstResponse, secondResponse];
		const successfulResponses = responses.filter(response => response.statusCode === 200);
		const rejectedResponses = responses.filter(response => response.statusCode === 400);
		expect(successfulResponses).toHaveLength(1);
		expect(rejectedResponses).toHaveLength(1);
		expect(rejectedResponses[0].json()).toEqual({
			error: 'maxQuantityInventory'
		});
		const inventory = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventory.quantity).toBe(maxQuantity);
		/*
		 * The failed second transaction rolled
		 * its Gold debit back.
		 */
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - price);
		/*
		 * Exactly ONE successful purchase.
		 */
		await expect
			.poll(async () => {
				return prisma.gameLog.count({
					where: {
						userId: user.id,
						type: {
							in: [GameLogType.GoldLost, GameLogType.ItemBought]
						}
					}
				});
			})
			.toBe(2);
	});
});

describe('location-restricted shop purchases', () => {
	it('rejects the purchase when no Dinoz is at the shop location', async () => {
		const user = await createTestUser({
			name: 'WrongLocationBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		const { shopId, itemId, price } = getForgeShopTestItem();
		const initialGold = price + 500;
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
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: `You don't have any dinoz at the shop's location ${shopId}`
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
		const inventoryItem = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem).toBeNull();
	});

	it('allows the purchase when a Dinoz is at the shop location', async () => {
		const user = await createTestUser({
			name: 'ForgeShopBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.FORGES_DU_GTC
		});
		const { shopId, itemId, price } = getForgeShopTestItem();
		const initialGold = price + 500;
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
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			itemId,
			quantity: 1,
			gold: price
		});
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(initialGold - price);
		const inventoryItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem.quantity).toBe(1);
		await waitForPurchaseLogs(user.id);
	});
});

describe('ShopKeeper inventory capacity', () => {
	it('allows a ShopKeeper to exceed the normal inventory limit', async () => {
		const user = await createTestUser({
			name: 'ShopKeeperBuyer',
			shopKeeper: true
		});
		const { shopId, itemId, price, maxQuantity } = getFlyingShopTestItem();
		const shopKeeperMaxQuantity = Math.round(maxQuantity * 1.5);
		expect(shopKeeperMaxQuantity).toBeGreaterThan(maxQuantity);
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: price + 500
			}
		});
		/*
		 * Normal player would already be full here.
		 */
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId,
				quantity: maxQuantity
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(200);
		const inventoryItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryItem.quantity).toBe(maxQuantity + 1);
		expect(inventoryItem.quantity).toBeLessThanOrEqual(shopKeeperMaxQuantity);
		await waitForPurchaseLogs(user.id);
	});

	it('allows reaching the ShopKeeper limit but rejects purchases beyond it without debiting gold', async () => {
		const user = await createTestUser({
			name: 'FullShopKeeperBuyer',
			shopKeeper: true
		});
		const { shopId, itemId, price, maxQuantity } = getFlyingShopTestItem();
		const shopKeeperMaxQuantity = Math.round(maxQuantity * 1.5);
		const initialGold = price * 2 + 500;
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
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId,
				quantity: shopKeeperMaxQuantity - 1
			}
		});
		const cookie = createAuthCookie(server, user);
		/*
		 * First purchase:
		 * limit - 1 → limit
		 */
		const allowedResponse = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(allowedResponse.statusCode).toBe(200);
		const inventoryAtMaximum = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryAtMaximum.quantity).toBe(shopKeeperMaxQuantity);
		const walletAfterAllowedPurchase = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfterAllowedPurchase.amount).toBe(initialGold - price);
		await waitForPurchaseLogs(user.id);

		/*
		 * Second purchase:
		 * limit → limit + 1
		 */
		const rejectedResponse = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(rejectedResponse.statusCode).toBe(400);
		expect(rejectedResponse.json()).toEqual({
			error: 'maxQuantityInventory'
		});
		/*
		 * Inventory remains exactly at the ShopKeeper limit.
		 */
		const inventoryAfterRejectedPurchase = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(inventoryAfterRejectedPurchase.quantity).toBe(shopKeeperMaxQuantity);
		/*
		 * Failed purchase must not debit gold.
		 */
		const walletAfterRejectedPurchase = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfterRejectedPurchase.amount).toBe(walletAfterAllowedPurchase.amount);
		/*
		 * Only the successful purchase generated logs.
		 */
		const purchaseLogCount = await prisma.gameLog.count({
			where: {
				userId: user.id,
				type: {
					in: [GameLogType.GoldLost, GameLogType.ItemBought]
				}
			}
		});
		expect(purchaseLogCount).toBe(2);
	});
});

describe('magic shop purchases', () => {
	it('buys a magical item using golden napodinos without spending gold', async () => {
		const user = await createTestUser({
			name: 'MagicShopBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		const { shopId, itemId, price } = getMagicShopTestItem();
		const napodinoItemId = itemList[Item.GOLDEN_NAPODINO].itemId;
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: napodinoItemId,
				quantity: 5
			}
		});
		const goldBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toMatchObject({
			itemId,
			quantity: 1
		});
		const napodinos = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: napodinoItemId
				}
			}
		});
		expect(napodinos.quantity).toBe(5 - price);
		const magicalItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(magicalItem.quantity).toBe(1);
		const goldAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(goldAfter.amount).toBe(goldBefore.amount);
		await waitForMagicPurchaseLogs(user.id);
	});

	it('rejects a magical purchase when the player does not have enough golden napodinos', async () => {
		const user = await createTestUser({
			name: 'PoorMagicBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		const { shopId, itemId, price } = getMagicShopTestItem();
		const napodinoItemId = itemList[Item.GOLDEN_NAPODINO].itemId;
		const initialNapodinos = price - 1;
		await prisma.userItems.create({
			data: {
				userId: user.id,
				itemId: napodinoItemId,
				quantity: initialNapodinos
			}
		});
		const goldBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'notEnoughItems'
		});
		const napodinos = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: napodinoItemId
				}
			}
		});
		expect(napodinos.quantity).toBe(initialNapodinos);
		const magicalItem = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(magicalItem).toBeNull();
		const goldAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(goldAfter.amount).toBe(goldBefore.amount);
	});

	it('does not increase magical item capacity for a shopkeeper', async () => {
		const user = await createTestUser({
			name: 'MagicShopKeeper'
		});
		await prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				shopKeeper: true
			}
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.DINOVILLE
		});
		const { shopId, itemId, price, maxQuantity } = getMagicShopTestItem();
		const napodinoItemId = itemList[Item.GOLDEN_NAPODINO].itemId;
		await prisma.userItems.createMany({
			data: [
				{
					userId: user.id,
					itemId: napodinoItemId,
					quantity: price + 10
				},
				{
					userId: user.id,
					itemId,
					quantity: maxQuantity
				}
			]
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId,
				quantity: 1
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'maxQuantityInventory'
		});
		const magicalItem = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId
				}
			}
		});
		expect(magicalItem.quantity).toBe(maxQuantity);
		const napodinos = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: napodinoItemId
				}
			}
		});
		expect(napodinos.quantity).toBe(price + 10);
	});
});

describe('Filou shop exchanges', () => {
	it('exchanges ingredients for treasure tickets', async () => {
		const user = await createTestUser({
			name: 'FilouBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const { shopId, ingredientId, exchangeRate } = getFilouTestIngredient();
		const ticketQuantity = 2;
		const ingredientCost = exchangeRate * ticketQuantity;
		const initialIngredientQuantity = ingredientCost + 5;
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId,
				quantity: initialIngredientQuantity
			}
		});
		const ticketWalletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		const goldWalletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId: ingredientId,
				quantity: ticketQuantity
			}
		});
		expect(response.statusCode).toBe(200);
		expect(response.json()).toEqual({
			wallet: 'TREASURE_TICKET',
			quantity: ticketQuantity,
			total: ticketWalletBefore.amount + ticketQuantity
		});
		const ingredientAfter = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: user.id,
					ingredientId
				}
			}
		});
		expect(ingredientAfter.quantity).toBe(initialIngredientQuantity - ingredientCost);
		const ticketWalletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(ticketWalletAfter.amount).toBe(ticketWalletBefore.amount + ticketQuantity);
		const goldWalletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(goldWalletAfter.amount).toBe(goldWalletBefore.amount);
		await expect
			.poll(async () => {
				return prisma.gameLog.count({
					where: {
						userId: user.id,
						type: GameLogType.IngredientSold
					}
				});
			})
			.toBe(1);
	});

	it('rejects the exchange when the player does not have enough ingredients', async () => {
		const user = await createTestUser({
			name: 'PoorFilouBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const { shopId, ingredientId, exchangeRate } = getFilouTestIngredient();
		const ticketQuantity = 2;
		const requiredIngredients = exchangeRate * ticketQuantity;
		const initialIngredientQuantity = requiredIngredients - 1;
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId,
				quantity: initialIngredientQuantity
			}
		});
		const ticketWalletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		const cookie = createAuthCookie(server, user);
		const response = await server.inject({
			method: 'PUT',
			url: `/api/shop/buyitem/${shopId}`,
			headers: {
				cookie
			},
			payload: {
				itemId: ingredientId,
				quantity: ticketQuantity
			}
		});
		expect(response.statusCode).toBe(400);
		expect(response.json()).toEqual({
			error: 'notEnoughIngredients'
		});
		const ingredientAfter = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: user.id,
					ingredientId
				}
			}
		});
		expect(ingredientAfter.quantity).toBe(initialIngredientQuantity);
		const ticketWalletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(ticketWalletAfter.amount).toBe(ticketWalletBefore.amount);
	});

	it('prevents concurrent exchanges from spending the same ingredients twice', async () => {
		const user = await createTestUser({
			name: 'ConcurrentFilouBuyer'
		});
		await createTestDinoz({
			userId: user.id,
			placeId: PlaceEnum.PLACE_DU_MARCHE
		});
		const { shopId, ingredientId, exchangeRate } = getFilouTestIngredient();
		/*
		 * Exactly enough ingredients for ONE ticket.
		 */
		await prisma.userIngredients.create({
			data: {
				userId: user.id,
				ingredientId,
				quantity: exchangeRate
			}
		});
		const ticketWalletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		const cookie = createAuthCookie(server, user);
		/*
		 * Two requests hit the server at the same time.
		 *
		 * There are only enough ingredients for one.
		 */
		const [firstResponse, secondResponse] = await Promise.all([
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId: ingredientId,
					quantity: 1
				}
			}),
			server.inject({
				method: 'PUT',
				url: `/api/shop/buyitem/${shopId}`,
				headers: {
					cookie
				},
				payload: {
					itemId: ingredientId,
					quantity: 1
				}
			})
		]);
		const responses = [firstResponse, secondResponse];
		const successfulResponses = responses.filter(response => response.statusCode === 200);
		const rejectedResponses = responses.filter(response => response.statusCode === 400);
		expect(successfulResponses).toHaveLength(1);
		expect(rejectedResponses).toHaveLength(1);
		expect(rejectedResponses[0].json()).toEqual({
			error: 'notEnoughIngredients'
		});
		/*
		 * Ingredients must have been consumed exactly once.
		 */
		const ingredientAfter = await prisma.userIngredients.findUniqueOrThrow({
			where: {
				ingredientId_userId: {
					userId: user.id,
					ingredientId
				}
			}
		});
		expect(ingredientAfter.quantity).toBe(0);
		/*
		 * And exactly ONE ticket must have been credited.
		 */
		const ticketWalletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(ticketWalletAfter.amount).toBe(ticketWalletBefore.amount + 1);
		await expect
			.poll(async () => {
				return prisma.gameLog.count({
					where: {
						userId: user.id,
						type: GameLogType.IngredientSold
					}
				});
			})
			.toBe(1);
	});
});
