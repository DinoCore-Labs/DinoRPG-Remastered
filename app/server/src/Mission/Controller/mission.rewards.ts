import { dinozStatusIdByKey } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type {
	MissionCollectionKey,
	MissionEffectKey,
	MissionItemKey
} from '@dinorpg/core/models/missions/missionKey.js';
import { rewardIdByKey, statTrackingByCollectionKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { GameLogType, MoneyType, type Prisma } from '../../../../prisma/client.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { incrementUserStat } from '../../Stats/stats.service.js';

type MissionTransaction = Prisma.TransactionClient;

function resolveItemIdFromKey(itemKey: MissionItemKey): number {
	const item = Object.values(itemList).find(entry => entry.name === itemKey);
	if (!item) {
		throw new ExpectedError(`Unknown mission item key "${itemKey}"`);
	}
	return item.itemId;
}

function resolveStatusIdFromEffectKey(effectKey: MissionEffectKey): number {
	const statusId = dinozStatusIdByKey[effectKey];
	if (statusId == null) {
		throw new ExpectedError(`Unknown mission effect key "${effectKey}"`);
	}
	return statusId;
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
	const rewardSummary = {
		userId: dinoz.userId,
		xp: 0,
		gold: 0,
		items: [] as { itemKey: string; itemId: number; quantity: number }[],
		collections: [] as { collectionKey: string; rewardId: number; created: boolean }[],
		effects: [] as { effectKey: string; statusId: number; action: 'add' | 'remove' }[]
	};
	for (const reward of params.definition.rewards) {
		switch (reward.type) {
			case 'XP': {
				await applyMissionXpReward(tx, params.dinozId, reward.value);
				rewardSummary.xp += reward.value;
				await safeCreateGameLog({
					type: GameLogType.XPEarned,
					userId: dinoz.userId,
					dinozId: params.dinozId,
					values: [String(reward.value)],
					metadata: {
						source: 'mission',
						missionKey: params.definition.key,
						amount: reward.value
					}
				});
				break;
			}
			case 'GOLD': {
				await applyMissionGoldReward(tx, dinoz.userId, reward.value);
				rewardSummary.gold += reward.value;
				await safeCreateGameLog({
					type: GameLogType.GoldWon,
					userId: dinoz.userId,
					dinozId: params.dinozId,
					values: [String(reward.value)],
					metadata: {
						source: 'mission',
						missionKey: params.definition.key,
						amount: reward.value,
						wallet: MoneyType.GOLD
					}
				});
				break;
			}
			case 'ITEM': {
				const itemId = resolveItemIdFromKey(reward.itemKey);
				await applyMissionItemReward(tx, dinoz.userId, reward.itemKey, reward.quantity);
				rewardSummary.items.push({
					itemKey: reward.itemKey,
					itemId,
					quantity: reward.quantity
				});
				await safeCreateGameLog({
					type: GameLogType.ItemFound,
					userId: dinoz.userId,
					dinozId: params.dinozId,
					values: [String(itemId), String(reward.quantity)],
					metadata: {
						source: 'mission',
						missionKey: params.definition.key,
						itemKey: reward.itemKey,
						itemId,
						quantity: reward.quantity
					}
				});
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
				rewardSummary.collections.push({
					collectionKey: reward.collectionKey,
					rewardId: result.rewardId,
					created: result.created
				});
				break;
			}
			case 'EFFECT': {
				const statusId = resolveStatusIdFromEffectKey(reward.effectKey);
				await addStatusToDinoz(params.dinozId, statusId);
				rewardSummary.effects.push({
					effectKey: reward.effectKey,
					statusId,
					action: 'add'
				});
				break;
			}
			case 'REMOVE_EFFECT': {
				const statusId = resolveStatusIdFromEffectKey(reward.effectKey);
				await removeStatusFromDinoz(params.dinozId, statusId);
				rewardSummary.effects.push({
					effectKey: reward.effectKey,
					statusId,
					action: 'remove'
				});
				break;
			}
			default: {
				throw new ExpectedError(`Unsupported mission reward type "${(reward as { type: string }).type}"`);
			}
		}
	}
	await safeCreateGameLog({
		type: GameLogType.MissionFinished,
		userId: dinoz.userId,
		dinozId: params.dinozId,
		values: [],
		metadata: {
			missionKey: params.definition.key,
			group: params.definition.group,
			rewards: rewardSummary
		}
	});
	return rewardSummary;
}
