import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function addMoney(userId: string, money: number) {
	return prisma.userWallet.update({
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
}

export async function addTreasureTicket(userId: string, money: number) {
	return prisma.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: MoneyType.TREASURE_TICKET
			}
		},
		data: {
			amount: {
				increment: money
			}
		}
	});
}

export async function removeMoney(userId: string, money: number) {
	return prisma.$transaction(async tx => {
		const wallet = await tx.userWallet.findUnique({
			where: {
				userId_type: {
					userId,
					type: MoneyType.GOLD
				}
			},
			select: {
				id: true,
				amount: true
			}
		});
		if (!wallet) {
			throw new Error('Wallet not found');
		}

		if (wallet.amount < money) {
			throw new Error('Not enough gold');
		}

		return tx.userWallet.update({
			where: { id: wallet.id },
			data: {
				amount: { decrement: money }
			}
		});
	});
}

export async function removeTreasureTicket(userId: string, money: number) {
	return prisma.$transaction(async tx => {
		const wallet = await tx.userWallet.findUnique({
			where: {
				userId_type: {
					userId,
					type: MoneyType.TREASURE_TICKET
				}
			},
			select: {
				id: true,
				amount: true
			}
		});
		if (!wallet) {
			throw new Error('Wallet not found');
		}

		if (wallet.amount < money) {
			throw new Error('Not enough gold');
		}

		return tx.userWallet.update({
			where: { id: wallet.id },
			data: {
				amount: { decrement: money }
			}
		});
	});
}
