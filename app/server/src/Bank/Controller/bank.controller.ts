import {
	BANK_EXCHANGE_RATE_SECRET_KEY,
	generateBankExchangeRateBps,
	getBankExchangeRateFromBps,
	getTreasureTicketGoldValue
} from '@dinorpg/core/models/bank/constants.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

function formatRate(rateBps: number) {
	return {
		rateBps,
		rate: getBankExchangeRateFromBps(rateBps),
		goldPerTreasureTicket: getTreasureTicketGoldValue(1, rateBps)
	};
}

export async function refreshBankExchangeRate() {
	const rateBps = generateBankExchangeRateBps();
	await prisma.secret.upsert({
		where: {
			key: BANK_EXCHANGE_RATE_SECRET_KEY
		},
		create: {
			key: BANK_EXCHANGE_RATE_SECRET_KEY,
			value: String(rateBps)
		},
		update: {
			value: String(rateBps)
		}
	});
	return formatRate(rateBps);
}

export async function getBankExchangeRate() {
	const secret = await prisma.secret.findUnique({
		where: {
			key: BANK_EXCHANGE_RATE_SECRET_KEY
		}
	});
	if (!secret) {
		return refreshBankExchangeRate();
	}
	const rateBps = Number(secret.value);
	if (!Number.isInteger(rateBps)) {
		return refreshBankExchangeRate();
	}
	return formatRate(rateBps);
}

export async function convertTreasureTicketsToGold(userId: string, quantity: number) {
	if (!Number.isInteger(quantity) || quantity <= 0) {
		throw new ExpectedError('wrongQuantity');
	}
	const rate = await getBankExchangeRate();
	const goldToAdd = getTreasureTicketGoldValue(quantity, rate.rateBps);
	return prisma.$transaction(async tx => {
		const removedTickets = await tx.userWallet.updateMany({
			where: {
				userId,
				type: MoneyType.TREASURE_TICKET,
				amount: {
					gte: quantity
				}
			},
			data: {
				amount: {
					decrement: quantity
				}
			}
		});
		if (removedTickets.count !== 1) {
			throw new ExpectedError('notEnoughTreasureTicket');
		}
		const goldWallet = await tx.userWallet.upsert({
			where: {
				userId_type: {
					userId,
					type: MoneyType.GOLD
				}
			},
			create: {
				userId,
				type: MoneyType.GOLD,
				amount: goldToAdd
			},
			update: {
				amount: {
					increment: goldToAdd
				}
			},
			select: {
				amount: true
			}
		});
		const treasureTicketWallet = await tx.userWallet.findUnique({
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
		return {
			quantity,
			rate: rate.rate,
			rateBps: rate.rateBps,
			goldPerTreasureTicket: rate.goldPerTreasureTicket,
			goldAdded: goldToAdd,
			wallets: {
				gold: goldWallet.amount,
				treasureTicket: treasureTicketWallet?.amount ?? 0
			}
		};
	});
}
