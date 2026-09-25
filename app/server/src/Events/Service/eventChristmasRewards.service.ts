import { RewardEnum } from '@dinorpg/core/models/enums/Parser.js';
import { GameEvent } from '@dinorpg/core/models/events/events.js';
import { Item } from '@dinorpg/core/models/items/itemList.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { addItemToInventory } from '../../Inventory/Controller/addItem.controller.js';
import { newNotif } from '../../Notification/Service/notification.service.js';
import { prisma } from '../../prisma.js';
import { getClanEventRanking } from '../../Ranking/Controller/getEventRanking.controller.js';
import { addTreasureTicket } from '../../User/Controller/money.controller.js';

export async function distributeChristmasRewards() {
	const eventId = GameEvent.CHRISTMAS;

	console.log('[Christmas Event] Starting reward distribution...');

	// --- Individual Rewards ---
	// Fetch all users sorted by total piglous killed (getEventRanking handles pagination, so we fetch all or in batches)
	// Since we need to distribute up to rank 100+ (others >= 100 kills), let's fetch all participants.
	const trackings = await prisma.userEventTracking.findMany({
		where: { eventId, total: { gt: 0 } },
		orderBy: { total: 'desc' }
	});

	console.log(`[Christmas Event] Found ${trackings.length} participants.`);

	let rank = 1;
	for (const t of trackings) {
		const userId = t.userId;
		const kills = t.total;

		const promises = [];
		const rewards = [];

		if (rank >= 1 && rank <= 5) {
			promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 2));
			promises.push(addItemToInventory(userId, Item.FEROSS_EGG_CHRISTMAS, 1));
			promises.push(addItemToInventory(userId, Item.SANTAZ_EGG_RARE, 1));
			promises.push(addTreasureTicket(userId, 100));
			promises.push(addItemToInventory(userId, Item.SMOG_EGG, 1));

			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 2 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.FEROSS_EGG_CHRISTMAS, quantity: 1 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.SANTAZ_EGG_RARE, quantity: 1 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.SMOG_EGG, quantity: 1 });
		} else if (rank >= 6 && rank <= 20) {
			promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
			promises.push(addItemToInventory(userId, Item.SANTAZ_EGG, 1));
			promises.push(addTreasureTicket(userId, 75));
			promises.push(addItemToInventory(userId, Item.SMOG_EGG, 1));

			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.SANTAZ_EGG, quantity: 1 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.SMOG_EGG, quantity: 1 });
		} else if (rank >= 21 && rank <= 50) {
			promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
			promises.push(addTreasureTicket(userId, 50));
			promises.push(addItemToInventory(userId, Item.CHRISTMAS_EGG, 1));

			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.CHRISTMAS_EGG, quantity: 1 });
		} else if (rank >= 51 && rank <= 100) {
			promises.push(addTreasureTicket(userId, 25));
			promises.push(addItemToInventory(userId, Item.CHRISTMAS_TICKET, 5));

			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.CHRISTMAS_TICKET, quantity: 5 });
		} else if (kills >= 500) {
			promises.push(addItemToInventory(userId, Item.CHRISTMAS_TICKET, 10));
			rewards.push({ rewardType: RewardEnum.ITEM, value: Item.CHRISTMAS_TICKET, quantity: 10 });
		}

		if (promises.length > 0) {
			promises.push(newNotif(userId, NotificationType.NEW_REWARD, JSON.stringify(rewards)));
			await Promise.all(promises);
		}

		rank++;
	}

	// --- Clan Rewards ---
	// Re-use the existing logic or fetch the clan ranking
	const clanData = await getClanEventRanking(eventId, 1, 1000);
	let clanRank = 1;

	for (const clan of clanData.ranking) {
		const clanId = clan.clanId;

		// Get all members of this clan
		const members = await prisma.user.findMany({ where: { clanId } });

		for (const member of members) {
			const userId = member.id;
			const promises = [];
			const rewards = [];

			if (clanRank === 1) {
				promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 2));
				promises.push(addTreasureTicket(userId, 150));
				promises.push(addItemToInventory(userId, Item.MAHAMUTI_EGG, 1));

				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 2 });
				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.MAHAMUTI_EGG, quantity: 1 });
			} else if (clanRank === 2 || clanRank === 3) {
				promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
				promises.push(addTreasureTicket(userId, 100));
				promises.push(addItemToInventory(userId, Item.MAHAMUTI_EGG, 1));

				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.MAHAMUTI_EGG, quantity: 1 });
			} else if (clanRank >= 4 && clanRank <= 10) {
				promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
				promises.push(addTreasureTicket(userId, 50));
				promises.push(addItemToInventory(userId, Item.SMOG_EGG, 1));

				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.SMOG_EGG, quantity: 1 });
			} else if (clanRank >= 11 && clanRank <= 20) {
				promises.push(addTreasureTicket(userId, 25));
				promises.push(addItemToInventory(userId, Item.CHRISTMAS_EGG, 1));

				rewards.push({ rewardType: RewardEnum.ITEM, value: Item.CHRISTMAS_EGG, quantity: 1 });
			}

			if (promises.length > 0) {
				promises.push(newNotif(userId, NotificationType.NEW_REWARD, JSON.stringify(rewards)));
				await Promise.all(promises);
			}
		}

		clanRank++;
	}

	console.log('[Christmas Event] Distribution complete!');
}
