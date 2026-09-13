import { Item } from '@dinorpg/core/models/items/itemList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { addItemToInventory } from '../../src/Inventory/Controller/addItem.controller.js';
import { removeItem } from '../../src/Inventory/Controller/removeItem.controller.js';
import { prisma } from '../../src/prisma.js';
import {
	addMoney,
	addTreasureTicket,
	removeMoney,
	removeTreasureTicket
} from '../../src/User/Controller/money.controller.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function waitForGameLog(userId: string): Promise<void> {
	await expect
		.poll(async () => {
			return prisma.gameLog.count({
				where: {
					userId
				}
			});
		})
		.toBeGreaterThan(0);
}

describe('economy', () => {
	it('adds gold to the player wallet', async () => {
		const user = await createTestUser();
		const walletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		await addMoney(user.id, 250);
		const walletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(walletAfter.amount).toBe(walletBefore.amount + 250);
		await waitForGameLog(user.id);
	});

	it('removes gold from the player wallet', async () => {
		const user = await createTestUser();
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: 500
			}
		});
		await removeMoney(user.id, 125);
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(375);
		await waitForGameLog(user.id);
	});

	it('does not allow the gold wallet to become negative', async () => {
		const user = await createTestUser();
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			},
			data: {
				amount: 100
			}
		});
		await expect(removeMoney(user.id, 101)).rejects.toThrow('Not enough gold');
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'GOLD'
				}
			}
		});
		expect(wallet.amount).toBe(100);
	});

	it('adds treasure tickets to the player wallet', async () => {
		const user = await createTestUser();
		const walletBefore = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		await addTreasureTicket(user.id, 3);
		const walletAfter = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(walletAfter.amount).toBe(walletBefore.amount + 3);
	});

	it('does not allow the treasure ticket wallet to become negative', async () => {
		const user = await createTestUser();
		await prisma.userWallet.update({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			},
			data: {
				amount: 2
			}
		});
		await expect(removeTreasureTicket(user.id, 3)).rejects.toThrow('Not enough treasure tickets');
		const wallet = await prisma.userWallet.findUniqueOrThrow({
			where: {
				userId_type: {
					userId: user.id,
					type: 'TREASURE_TICKET'
				}
			}
		});
		expect(wallet.amount).toBe(2);
	});
});

describe('inventory', () => {
	it('adds an item to the player inventory', async () => {
		const user = await createTestUser();
		await addItemToInventory(user.id, Item.DAILY_TICKET, 2);
		const item = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: Item.DAILY_TICKET
				}
			}
		});
		expect(item.quantity).toBe(2);
	});

	it('increments the quantity instead of creating another inventory row', async () => {
		const user = await createTestUser();
		await addItemToInventory(user.id, Item.DAILY_TICKET, 2);
		await addItemToInventory(user.id, Item.DAILY_TICKET, 3);
		const item = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: Item.DAILY_TICKET
				}
			}
		});
		expect(item.quantity).toBe(5);
		const rows = await prisma.userItems.count({
			where: {
				userId: user.id,
				itemId: Item.DAILY_TICKET
			}
		});
		expect(rows).toBe(1);
	});

	it('removes part of an item quantity', async () => {
		const user = await createTestUser();
		await addItemToInventory(user.id, Item.DAILY_TICKET, 5);
		await removeItem(user.id, Item.DAILY_TICKET, 2);
		const item = await prisma.userItems.findUniqueOrThrow({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: Item.DAILY_TICKET
				}
			}
		});
		expect(item.quantity).toBe(3);
	});

	it('deletes the inventory row when the quantity reaches zero', async () => {
		const user = await createTestUser();
		await addItemToInventory(user.id, Item.DAILY_TICKET, 2);
		await removeItem(user.id, Item.DAILY_TICKET, 2);
		const item = await prisma.userItems.findUnique({
			where: {
				itemId_userId: {
					userId: user.id,
					itemId: Item.DAILY_TICKET
				}
			}
		});
		expect(item).toBeNull();
	});
});
