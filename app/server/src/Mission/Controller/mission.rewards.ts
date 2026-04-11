import { itemList } from '@dinorpg/core/models/items/itemList.js';
import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type { MissionCollectionKey, MissionItemKey } from '@dinorpg/core/models/missions/missionKey.js';
import { rewardIdByKey, statTrackingByCollectionKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { MoneyType, type Prisma } from '../../../../prisma/client.js';
import { incrementUserStat } from '../../Stats/stats.service.js';

type MissionTransaction = Prisma.TransactionClient;

function resolveItemIdFromKey(itemKey: MissionItemKey): number {
	const item = Object.values(itemList).find(entry => entry.name === itemKey);

	if (!item) {
		throw new ExpectedError(`Unknown mission item key "${itemKey}"`);
	}

	return item.itemId;
}

function getCollectionRewardId(collectionKey: string): number {
	const rewardId = rewardIdByKey[collectionKey];

	if (rewardId == null) {
		throw new ExpectedError(`Unknown collection key "${collectionKey}"`);
	}

	return rewardId;
}

async function applyMissionXpReward(tx: MissionTransaction, dinozId: number, xp: number) {
	await tx.dinoz.update({
		where: { id: dinozId },
		data: {
			experience: {
				increment: xp
			}
		}
	});
}

async function applyMissionGoldReward(tx: MissionTransaction, userId: string, gold: number) {
	await tx.userWallet.update({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		},
		data: {
			amount: {
				increment: gold
			}
		}
	});
}

async function applyMissionItemReward(
	tx: MissionTransaction,
	userId: string,
	itemKey: MissionItemKey,
	quantity: number
) {
	const itemId = resolveItemIdFromKey(itemKey);

	await tx.userItems.upsert({
		where: {
			itemId_userId: {
				itemId,
				userId
			}
		},
		create: {
			userId,
			itemId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});
}

async function applyMissionCollectionReward(
	tx: MissionTransaction,
	userId: string,
	collectionKey: MissionCollectionKey
) {
	const rewardId = getCollectionRewardId(collectionKey);

	const existingReward = await tx.userRewards.findUnique({
		where: {
			rewardId_userId: {
				rewardId,
				userId
			}
		},
		select: {
			userId: true
		}
	});

	if (existingReward) {
		return {
			rewardId,
			created: false
		};
	}

	await tx.userRewards.create({
		data: {
			userId,
			rewardId
		}
	});

	return {
		rewardId,
		created: true
	};
}

export async function applyMissionRewards(
	tx: MissionTransaction,
	params: {
		dinozId: number;
		definition: MissionDefinition;
	}
) {
	const dinoz = await tx.dinoz.findUnique({
		where: { id: params.dinozId },
		select: {
			id: true,
			userId: true
		}
	});

	if (!dinoz) {
		throw new ExpectedError(`Unknown dinoz "${params.dinozId}"`);
	}

	for (const reward of params.definition.rewards) {
		switch (reward.type) {
			case 'XP': {
				await applyMissionXpReward(tx, params.dinozId, reward.value);
				break;
			}

			case 'GOLD': {
				await applyMissionGoldReward(tx, dinoz.userId, reward.value);
				break;
			}

			case 'ITEM': {
				await applyMissionItemReward(tx, dinoz.userId, reward.itemKey, reward.quantity);
				break;
			}

			case 'COLLECTION': {
				const result = await applyMissionCollectionReward(tx, dinoz.userId, reward.collectionKey);

				if (result.created) {
					const statTracking = statTrackingByCollectionKey[reward.collectionKey];

					if (statTracking !== undefined) {
						await incrementUserStat(statTracking, dinoz.userId, 1);
					}
				}

				break;
			}

			default: {
				throw new ExpectedError(`Unsupported mission reward type "${(reward as { type: string }).type}"`);
			}
		}
	}
}
