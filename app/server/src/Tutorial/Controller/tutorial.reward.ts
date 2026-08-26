import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { resolveItemIdFromKey } from '@dinorpg/core/models/items/itemIdByKey.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { rewardIdByKey, statTrackingByCollectionKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import type { TutorialReward } from '@dinorpg/core/models/tutorial/tutorial.js';

import { MoneyType, Prisma } from '../../../../prisma/index.js';

type TutorialTransaction = Prisma.TransactionClient;

function assertPositiveInteger(value: number, label: string) {
	if (!Number.isInteger(value) || value <= 0) {
		throw new Error(`${label} must be a positive integer, received "${value}"`);
	}
}

function resolveTutorialItemId(key: string): number {
	const itemId = resolveItemIdFromKey(key);
	if (itemId == null) {
		throw new Error(`Unknown tutorial item reward key "${key}"`);
	}
	const itemExists = Object.values(itemList).some(item => item.itemId === itemId);
	if (!itemExists) {
		throw new Error(`Unknown tutorial item reward id "${itemId}"`);
	}
	return itemId;
}

function resolveTutorialIngredientId(key: string): number {
	const numericId = Number(key);
	if (Number.isInteger(numericId)) {
		const ingredient = Object.values(ingredientList).find(ingredient => ingredient.ingredientId === numericId);
		if (ingredient) {
			return ingredient.ingredientId;
		}
	}
	const ingredient = Object.values(ingredientList).find(ingredient => ingredient.name === key);
	if (!ingredient) {
		throw new Error(`Unknown tutorial ingredient reward key "${key}"`);
	}
	return ingredient.ingredientId;
}

async function addGoldReward(tx: TutorialTransaction, userId: string, amount: number) {
	assertPositiveInteger(amount, 'Tutorial gold reward');
	await tx.userWallet.upsert({
		where: {
			userId_type: {
				userId,
				type: MoneyType.GOLD
			}
		},
		create: {
			userId,
			type: MoneyType.GOLD,
			amount
		},
		update: {
			amount: {
				increment: amount
			}
		}
	});
}

async function addItemReward(tx: TutorialTransaction, userId: string, key: string, quantity: number) {
	assertPositiveInteger(quantity, 'Tutorial item reward quantity');
	const itemId = resolveTutorialItemId(key);
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

async function addIngredientReward(tx: TutorialTransaction, userId: string, key: string, quantity: number) {
	assertPositiveInteger(quantity, 'Tutorial ingredient reward quantity');
	const ingredientId = resolveTutorialIngredientId(key);
	await tx.userIngredients.upsert({
		where: {
			ingredientId_userId: {
				ingredientId,
				userId
			}
		},
		create: {
			userId,
			ingredientId,
			quantity
		},
		update: {
			quantity: {
				increment: quantity
			}
		}
	});
}

async function addCollectionReward(tx: TutorialTransaction, userId: string, key: string) {
	const rewardId = rewardIdByKey[key];
	if (rewardId == null) {
		throw new Error(`Unknown tutorial collection reward key "${key}"`);
	}
	const existingReward = await tx.userRewards.findUnique({
		where: {
			rewardId_userId: {
				rewardId,
				userId
			}
		},
		select: {
			id: true
		}
	});
	if (existingReward) {
		return;
	}
	await tx.userRewards.create({
		data: {
			userId,
			rewardId
		}
	});
	/*
	 * Certaines collections possèdent également un compteur
	 * UserTracking associé.
	 */
	const statTracking = statTrackingByCollectionKey[key];
	if (statTracking !== undefined) {
		await tx.userTracking.upsert({
			where: {
				stat_userId: {
					stat: statTracking,
					userId
				}
			},
			create: {
				stat: statTracking,
				quantity: 1,
				userId
			},
			update: {
				quantity: {
					increment: 1
				}
			}
		});
	}
}

async function applyTutorialReward(tx: TutorialTransaction, userId: string, reward: TutorialReward) {
	switch (reward.type) {
		case 'gold':
			await addGoldReward(tx, userId, reward.amount);
			return;
		case 'item':
			await addItemReward(tx, userId, reward.key, reward.quantity);
			return;
		case 'ingredient':
			await addIngredientReward(tx, userId, reward.key, reward.quantity);
			return;
		case 'collection':
			await addCollectionReward(tx, userId, reward.key);
			return;
	}
}

export async function applyTutorialRewards(
	tx: TutorialTransaction,
	userId: string,
	rewards: readonly TutorialReward[]
) {
	for (const reward of rewards) {
		await applyTutorialReward(tx, userId, reward);
	}
}
