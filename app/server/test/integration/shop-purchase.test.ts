import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import type { FastifyInstance } from 'fastify';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { GameLogType } from '../../../prisma/index.js';
import { prisma } from '../../src/prisma.js';
import buildServer from '../../src/server.js';
import { createAuthCookie } from '../helpers/auth.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser, TEST_USER_PASSWORD } from '../helpers/factories/user.factory.js';

let server: FastifyInstance;

function extractCookie(rawHeader: string | string[] | number | undefined, name: string): string {
	const values = Array.isArray(rawHeader) ? rawHeader : rawHeader !== undefined ? [String(rawHeader)] : [];
	const cookie = values.find(value => value.startsWith(`${name}=`));
	if (!cookie) {
		throw new Error(`Cookie "${name}" was not found in response.`);
	}
	return cookie.split(';')[0];
}

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
		price: soldItem.price
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
});
