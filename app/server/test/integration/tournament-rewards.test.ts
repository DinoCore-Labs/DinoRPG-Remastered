import { RewardEnum } from '@dinorpg/core/models/enums/Parser.js';
import { StatTracking } from '@dinorpg/core/models/enums/StatsTracking.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { beforeEach, describe, expect, it } from 'vitest';

import { MoneyType } from '../../../prisma/index.js';
import { prisma } from '../../src/prisma.js';
import { getTournamentPrize, grantTournamentPrize } from '../../src/utils/tournamentRewards.js';
import { cleanDatabase } from '../helpers/database.js';
import { createTestUser } from '../helpers/factories/user.factory.js';

beforeEach(async () => {
	await cleanDatabase();
});

async function createTournament(cashPrice = 10_000) {
	return prisma.tournament.create({ data: { teamRace: '1,2', cashPrice } });
}

async function goldBalance(userId: string) {
	return (
		await prisma.userWallet.findUniqueOrThrow({
			where: { userId_type: { userId, type: MoneyType.GOLD } }
		})
	).amount;
}

async function tidWins(userId: string): Promise<number> {
	const tracking = await prisma.userTracking.findUnique({
		where: { stat_userId: { stat: StatTracking.TID1, userId } },
		select: { quantity: true }
	});
	return tracking?.quantity ?? 0;
}

describe('Tournament payouts', () => {
	it('keeps all original prize amounts and rank thresholds', () => {
		const prizes = [
			[1, 1500, 2],
			[2, 1000, 2],
			[3, 750, 2],
			[4, 750, 2],
			[5, 400, 1],
			[8, 400, 1],
			[9, 200, 1],
			[16, 200, 1],
			[17, 100, 0],
			[32, 100, 0],
			[33, 75, 0],
			[48, 75, 0],
			[49, 62, 0],
			[64, 62, 0]
		] as const;
		for (const [rank, gold, items] of prizes) {
			expect(getTournamentPrize(rank, 10_000)).toMatchObject({ gold });
			expect(getTournamentPrize(rank, 10_000).items).toHaveLength(items);
		}
	});

	it('does not fail if the winner already owns TID1, and pays once per tournament', async () => {
		const user = await createTestUser();
		const tournament = await createTournament();
		await prisma.userRewards.create({ data: { userId: user.id, rewardId: Reward.TID1 } });
		const before = await goldBalance(user.id);
		const grant = { tournamentId: tournament.id, userId: user.id, rank: 1, cashPrice: tournament.cashPrice };

		expect(await grantTournamentPrize(grant)).toBe(true);
		expect(await grantTournamentPrize(grant)).toBe(false);
		expect(await goldBalance(user.id)).toBe(before + 1500);
		expect(await prisma.userRewards.count({ where: { userId: user.id, rewardId: Reward.TID1 } })).toBe(1);
		expect(await tidWins(user.id)).toBe(1);
		expect(
			await prisma.tournamentRewardPayment.count({ where: { tournamentId: tournament.id, userId: user.id } })
		).toBe(1);
		expect(
			(
				await prisma.userItems.findUniqueOrThrow({
					where: { itemId_userId: { userId: user.id, itemId: Item.BOX_LEGENDARY } }
				})
			).quantity
		).toBe(1);
		expect(
			(
				await prisma.userItems.findUniqueOrThrow({
					where: { itemId_userId: { userId: user.id, itemId: Item.TOUFUFU_BABY_RARE } }
				})
			).quantity
		).toBe(1);
		const notifs = await prisma.notification.findMany({ where: { userId: user.id } });
		expect(notifs).toHaveLength(1);
		const rewards = JSON.parse(notifs[0].content as string) as Array<{ rewardType: RewardEnum }>;
		expect(rewards.some(reward => reward.rewardType === RewardEnum.EPIC)).toBe(false);
	});

	it('awards a new tournament without duplicating the permanent achievement', async () => {
		const user = await createTestUser();
		const first = await createTournament();
		const second = await createTournament();
		const startGold = await goldBalance(user.id);
		expect(
			await grantTournamentPrize({
				tournamentId: first.id,
				userId: user.id,
				rank: 1,
				cashPrice: first.cashPrice
			})
		).toBe(true);
		expect(
			await grantTournamentPrize({
				tournamentId: second.id,
				userId: user.id,
				rank: 1,
				cashPrice: second.cashPrice
			})
		).toBe(true);
		expect(await prisma.userRewards.count({ where: { userId: user.id, rewardId: Reward.TID1 } })).toBe(1);
		expect(await tidWins(user.id)).toBe(2);
		expect(await goldBalance(user.id)).toBe(startGold + 3000);
		expect(await prisma.tournamentRewardPayment.count({ where: { userId: user.id } })).toBe(2);
		expect(await prisma.notification.count({ where: { userId: user.id } })).toBe(2);
	});

	it('prevents duplicate payment when two retries race', async () => {
		const user = await createTestUser();
		const tournament = await createTournament();
		const startGold = await goldBalance(user.id);
		const input = { tournamentId: tournament.id, userId: user.id, rank: 2, cashPrice: tournament.cashPrice };
		const results = await Promise.all([grantTournamentPrize(input), grantTournamentPrize(input)]);
		expect(results.sort()).toEqual([false, true]);
		expect(await goldBalance(user.id)).toBe(startGold + 1000);
		expect(await tidWins(user.id)).toBe(0);
		expect(await prisma.notification.count({ where: { userId: user.id } })).toBe(1);
		expect(await prisma.tournamentRewardPayment.count({ where: { userId: user.id } })).toBe(1);
	});

	it('increments TID1 only once when two winner payout attempts run concurrently', async () => {
		const user = await createTestUser();
		const tournament = await createTournament();
		const input = { tournamentId: tournament.id, userId: user.id, rank: 1, cashPrice: tournament.cashPrice };
		const results = await Promise.all([grantTournamentPrize(input), grantTournamentPrize(input)]);
		expect(results.sort()).toEqual([false, true]);
		expect(await tidWins(user.id)).toBe(1);
		expect(await prisma.userRewards.count({ where: { userId: user.id, rewardId: Reward.TID1 } })).toBe(1);
		expect(
			await prisma.tournamentRewardPayment.count({ where: { userId: user.id, tournamentId: tournament.id } })
		).toBe(1);
	});

	it('rolls back the payment marker, items, badge and notification if the wallet is missing', async () => {
		const user = await createTestUser({ withWallets: false });
		const tournament = await createTournament();
		await expect(
			grantTournamentPrize({
				tournamentId: tournament.id,
				userId: user.id,
				rank: 1,
				cashPrice: tournament.cashPrice
			})
		).rejects.toThrow();
		expect(await prisma.tournamentRewardPayment.count({ where: { userId: user.id } })).toBe(0);
		expect(await prisma.userItems.count({ where: { userId: user.id } })).toBe(0);
		expect(await prisma.userRewards.count({ where: { userId: user.id } })).toBe(0);
		expect(await tidWins(user.id)).toBe(0);
		expect(await prisma.notification.count({ where: { userId: user.id } })).toBe(0);
	});
});
