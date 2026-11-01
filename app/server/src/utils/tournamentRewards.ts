import { RewardEnum } from '@dinorpg/core/models/enums/Parser.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';

import { GameLogType, MoneyType } from '../../../prisma/index.js';
import { createGameLog } from '../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../prisma.js';
import { incrementUserStat } from '../Stats/stats.service.js';

type TournamentPrize = {
	gold: number;
	items: number[];
};

// Keep the same rank thresholds and rewards as the original tournament rules.
export function getTournamentPrize(rank: number, cashPrice: number): TournamentPrize {
	if (rank === 1) return { gold: Math.floor(cashPrice * 0.15), items: [Item.TOUFUFU_BABY_RARE, Item.BOX_LEGENDARY] };
	if (rank === 2) return { gold: Math.floor(cashPrice * 0.1), items: [Item.TOUFUFU_BABY, Item.BOX_LEGENDARY] };
	if (rank <= 4) return { gold: Math.floor(cashPrice * 0.075), items: [Item.TOUFUFU_BABY, Item.BOX_EPIC] };
	if (rank <= 8) return { gold: Math.floor(cashPrice * 0.04), items: [Item.BOX_RARE] };
	if (rank <= 16) return { gold: Math.floor(cashPrice * 0.02), items: [Item.BOX_RARE] };
	if (rank <= 32) return { gold: Math.floor(cashPrice * 0.01), items: [] };
	if (rank <= 48) return { gold: Math.floor(cashPrice * 0.0075), items: [] };
	return { gold: Math.floor(cashPrice * 0.00625), items: [] };
}

type GrantTournamentPrizeInput = {
	tournamentId: string;
	userId: string;
	rank: number;
	cashPrice: number;
};

/**
 * The payment marker, inventory, wallet, epic reward, notification and gold log
 * commit together. A failed transaction leaves no marker, so retry is safe.
 * TID1 is a permanent achievement, whereas the victory counter is cumulative.
 */
export async function grantTournamentPrize(
	{ tournamentId, userId, rank, cashPrice }: GrantTournamentPrizeInput,
	prismaClient = prisma
): Promise<boolean> {
	const prize = getTournamentPrize(rank, cashPrice);

	return prismaClient.$transaction(async tx => {
		const marker = await tx.tournamentRewardPayment.createMany({
			data: [{ tournamentId, userId, rank }],
			skipDuplicates: true
		});
		if (marker.count === 0) return false;

		const notificationRewards: Array<{ rewardType: RewardEnum; value: number; quantity?: number }> = [];

		if (rank === 1) {
			// Count each distinct tournament victory, even if the player already owns
			// the permanent TID1 achievement. The payment marker prevents double counts.
			await incrementUserStat(StatTracking.TID1, userId, 1, tx);

			const badge = await tx.userRewards.createMany({
				data: [{ userId, rewardId: Reward.TID1 }],
				skipDuplicates: true
			});
			if (badge.count === 1) {
				notificationRewards.push({ rewardType: RewardEnum.EPIC, value: Reward.TID1 });
			}
		}

		notificationRewards.push({ rewardType: RewardEnum.GOLD, value: prize.gold });

		for (const itemId of prize.items) {
			await tx.userItems.upsert({
				where: { itemId_userId: { userId, itemId } },
				create: { userId, itemId, quantity: 1 },
				update: { quantity: { increment: 1 } }
			});
			notificationRewards.push({ rewardType: RewardEnum.ITEM, value: itemId, quantity: 1 });
		}

		if (prize.gold !== 0) {
			const wallet = await tx.userWallet.update({
				where: { userId_type: { userId, type: MoneyType.GOLD } },
				data: { amount: { increment: prize.gold } }
			});
			await createGameLog(
				{
					type: GameLogType.GoldWon,
					userId,
					values: [String(prize.gold)],
					metadata: {
						source: 'tournament',
						tournamentId,
						rank,
						amount: prize.gold,
						wallet: MoneyType.GOLD,
						previousAmount: wallet.amount - prize.gold,
						newAmount: wallet.amount
					}
				},
				tx
			);
		}

		await tx.notification.create({
			data: {
				userId,
				type: NotificationType.NEW_REWARD,
				content: JSON.stringify(notificationRewards)
			}
		});
		return true;
	});
}
