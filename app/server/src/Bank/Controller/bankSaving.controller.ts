import {
	BANK_SAVING_MAX_DEPOSIT,
	BANK_SAVING_PLANS,
	getBankSavingInterestGold,
	getBankSavingInterestRateFromBps,
	getBankSavingPlan,
	getBankSavingTotalGold
} from '@dinorpg/core/models/bank/constants.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

const DAY_IN_MS = 24 * 60 * 60 * 1000;

type BankSavingData = {
	id: string;
	amount: number;
	durationDays: number;
	interestRateBps: number;
	unlockAt: Date;
	claimedAt: Date | null;
	createdAt: Date;
};

function addDays(date: Date, days: number) {
	return new Date(date.getTime() + days * DAY_IN_MS);
}

function formatBankSaving(saving: BankSavingData, now = new Date()) {
	const interestGold = getBankSavingInterestGold(saving.amount, saving.interestRateBps);
	return {
		id: saving.id,
		amount: saving.amount,
		durationDays: saving.durationDays,
		interestRateBps: saving.interestRateBps,
		interestRate: getBankSavingInterestRateFromBps(saving.interestRateBps),
		interestGold,
		totalGold: saving.amount + interestGold,
		unlockAt: saving.unlockAt.toISOString(),
		claimedAt: saving.claimedAt?.toISOString() ?? null,
		createdAt: saving.createdAt.toISOString(),
		canClaim: !saving.claimedAt && saving.unlockAt.getTime() <= now.getTime()
	};
}

export async function getBankSavings(userId: string) {
	const now = new Date();
	const savings = await prisma.bankSaving.findMany({
		where: {
			userId
		},
		orderBy: [
			{
				claimedAt: 'asc'
			},
			{
				unlockAt: 'asc'
			}
		]
	});
	return {
		plans: BANK_SAVING_PLANS.map(plan => ({
			durationDays: plan.durationDays,
			interestRateBps: plan.interestRateBps,
			interestRate: getBankSavingInterestRateFromBps(plan.interestRateBps)
		})),
		savings: savings.map(saving => formatBankSaving(saving, now))
	};
}

export async function createBankSaving(userId: string, amount: number, durationDays: number) {
	if (!Number.isInteger(amount) || amount <= 0) {
		throw new ExpectedError('wrongQuantity');
	}
	if (amount > BANK_SAVING_MAX_DEPOSIT) {
		throw new ExpectedError('bankSavingMaxDepositExceeded');
	}
	const plan = getBankSavingPlan(durationDays);
	if (!plan) {
		throw new ExpectedError('wrongBankSavingDuration');
	}
	const now = new Date();
	const unlockAt = addDays(now, plan.durationDays);
	return prisma.$transaction(async tx => {
		const activeSaving = await tx.bankSaving.findFirst({
			where: {
				userId,
				durationDays: plan.durationDays,
				claimedAt: null
			},
			select: {
				id: true
			}
		});
		if (activeSaving) {
			throw new ExpectedError('bankSavingPlanAlreadyActive');
		}
		const removedGold = await tx.userWallet.updateMany({
			where: {
				userId,
				type: MoneyType.GOLD,
				amount: {
					gte: amount
				}
			},
			data: {
				amount: {
					decrement: amount
				}
			}
		});
		if (removedGold.count !== 1) {
			throw new ExpectedError('notEnoughGold');
		}
		const saving = await tx.bankSaving.create({
			data: {
				userId,
				amount,
				durationDays: plan.durationDays,
				interestRateBps: plan.interestRateBps,
				unlockAt
			}
		});
		const goldWallet = await tx.userWallet.findUnique({
			where: {
				userId_type: {
					userId,
					type: MoneyType.GOLD
				}
			},
			select: {
				amount: true
			}
		});
		return {
			saving: formatBankSaving(saving, now),
			wallets: {
				gold: goldWallet?.amount ?? 0
			}
		};
	});
}

export async function claimBankSaving(userId: string, savingId: string) {
	const now = new Date();
	return prisma.$transaction(async tx => {
		const saving = await tx.bankSaving.findFirst({
			where: {
				id: savingId,
				userId
			}
		});
		if (!saving) {
			throw new ExpectedError('bankSavingNotFound');
		}
		if (saving.claimedAt) {
			throw new ExpectedError('bankSavingAlreadyClaimed');
		}
		if (saving.unlockAt.getTime() > now.getTime()) {
			throw new ExpectedError('bankSavingNotReady');
		}
		const totalGold = getBankSavingTotalGold(saving.amount, saving.interestRateBps);
		const claimed = await tx.bankSaving.update({
			where: {
				id: saving.id
			},
			data: {
				claimedAt: now
			}
		});
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
				amount: totalGold
			},
			update: {
				amount: {
					increment: totalGold
				}
			},
			select: {
				amount: true
			}
		});
		return {
			saving: formatBankSaving(claimed, now),
			wallets: {
				gold: goldWallet.amount
			}
		};
	});
}
