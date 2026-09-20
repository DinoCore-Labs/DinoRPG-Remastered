import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { GameLogType, MoneyType, Prisma } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';

export async function addMoney(userId: string, money: number) {
	const wallet = await prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		},
		data: {
			amount: {
				increment: money
			}
		}
	});
	safeCreateGameLog({
		type: GameLogType.GoldWon,
		userId,
		values: [String(money)],
		metadata: {
			amount: money,
			wallet: MoneyType.GOLD,
			previousAmount: wallet.amount - money,
			newAmount: wallet.amount
		}
	});
	return wallet;
}

export async function addTreasureTicket(userId: string, money: number) {
	return prisma.userWallet.upsert({
		where: {
			userId_type: {
				userId,
				type: MoneyType.TREASURE_TICKET
			}
		},
		update: {
			amount: {
				increment: money
			}
		},
		create: {
			userId,
			type: MoneyType.TREASURE_TICKET,
			amount: money
		}
	});
}

export async function removeMoneyTx(tx: Prisma.TransactionClient, userId: string, money: number) {
	const removedGold = await tx.userWallet.updateMany({
		where: {
			userId,
			type: MoneyType.GOLD,
			amount: {
				gte: money
			}
		},
		data: {
			amount: {
				decrement: money
			}
		}
	});
	if (removedGold.count !== 1) {
		const wallet = await tx.userWallet.findUnique({
			where: {
				userId_type: {
					userId,
					type: MoneyType.GOLD
				}
			},
			select: {
				id: true
			}
		});
		if (!wallet) {
			throw new Error('Wallet not found');
		}
		throw new ExpectedError('notEnoughMoney');
	}
	return tx.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		}
	});
}

export async function removeMoney(userId: string, money: number) {
	const wallet = await prisma.$transaction(tx => removeMoneyTx(tx, userId, money));
	safeCreateGameLog({
		type: GameLogType.GoldLost,
		userId,
		values: [String(money)],
		metadata: {
			amount: money,
			wallet: MoneyType.GOLD,
			previousAmount: wallet.amount + money,
			newAmount: wallet.amount
		}
	});
	return wallet;
}

export async function removeTreasureTicketTx(tx: Prisma.TransactionClient, userId: string, money: number) {
	const removed = await tx.userWallet.updateMany({
		where: {
			userId,
			type: MoneyType.TREASURE_TICKET,
			amount: {
				gte: money
			}
		},
		data: {
			amount: {
				decrement: money
			}
		}
	});
	if (removed.count !== 1) {
		const wallet = await tx.userWallet.findUnique({
			where: {
				userId_type: {
					userId,
					type: MoneyType.TREASURE_TICKET
				}
			},
			select: {
				amount: true
			}
		});
		if (!wallet) {
			throw new Error('Wallet not found');
		}
		throw new ExpectedError('notEnoughMoney', {
			params: {
				moneyType: MoneyType.TREASURE_TICKET,
				required: money,
				current: wallet.amount
			}
		});
	}
	return tx.userWallet.findUniqueOrThrow({
		where: {
			userId_type: {
				userId,
				type: MoneyType.TREASURE_TICKET
			}
		}
	});
}

export async function removeTreasureTicket(userId: string, money: number) {
	return prisma.$transaction(tx => removeTreasureTicketTx(tx, userId, money));
}
