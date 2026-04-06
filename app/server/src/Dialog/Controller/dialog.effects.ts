import { DialogEffect } from '@dinorpg/core/models/dialogs/dialogEffect.js';
import { RuntimeDialog, RuntimeDialogPhase } from '@dinorpg/core/models/dialogs/dialogRuntime.js';
import { DialogSpecial } from '@dinorpg/core/models/dialogs/dialogSpecial.js';
import { dinozStatusIdByKey, dinozStatusKeyById } from '@dinorpg/core/models/dinoz/statusKeyMap.js';
import { rewardIdByKey } from '@dinorpg/core/models/rewards/rewardsKeyMap.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { Prisma } from '../../../../prisma/client.js';
import { addStatusToDinoz, removeStatusFromDinoz } from '../../Dinoz/Controller/dinozStatus.controller.js';
import { DialogContext } from './dialog.context.js';

type DialogTransaction = Prisma.TransactionClient;

type ApplyDialogPhaseEffectsParams = {
	context: DialogContext;
	dialog: Pick<RuntimeDialog, 'id'>;
	phase: Pick<RuntimeDialogPhase, 'id' | 'effects' | 'special'>;
};

function getUserQuestWhere(userId: string, questKey: string) {
	return {
		questKey_userId: {
			questKey,
			userId
		}
	};
}

function getUserItemWhere(userId: string, itemId: number) {
	return {
		itemId_userId: {
			itemId,
			userId
		}
	};
}

function getUserIngredientWhere(userId: string, ingredientId: number) {
	return {
		ingredientId_userId: {
			ingredientId,
			userId
		}
	};
}

function assertPositiveCount(count: number, label: string) {
	if (!Number.isInteger(count) || count <= 0) {
		throw new Error(`${label} must be a positive integer, received "${count}"`);
	}
}

function assertEnoughQuantity(currentQuantity: number, requiredQuantity: number, resourceLabel: string) {
	if (currentQuantity < requiredQuantity) {
		throw new ExpectedError(`Not enough ${resourceLabel}: required ${requiredQuantity}, current ${currentQuantity}`);
	}
}

/*async function upsertScenarioProgress(tx: DialogTransaction, userId: string, scenarioKey: string, progression: number) {
	await tx.userQuest.upsert({
		where: getUserQuestWhere(userId, scenarioKey),
		create: {
			userId,
			questKey: scenarioKey,
			progression,
			tracking: 0
		},
		update: {
			progression
		}
	});
}*/

/*async function incrementScenarioProgress(tx: DialogTransaction, userId: string, scenarioKey: string, delta: number) {
	const existingScenario = await tx.userQuest.findUnique({
		where: getUserQuestWhere(userId, scenarioKey),
		select: {
			id: true,
			progression: true
		}
	});

	if (!existingScenario) {
		await tx.userQuest.create({
			data: {
				userId,
				questKey: scenarioKey,
				progression: delta,
				tracking: 0
			}
		});

		return;
	}

	await tx.userQuest.update({
		where: { id: existingScenario.id },
		data: {
			progression: existingScenario.progression + delta
		}
	});
}*/

async function addUserItem(tx: DialogTransaction, userId: string, itemId: number, count: number) {
	assertPositiveCount(count, 'Item count');

	await tx.userItems.upsert({
		where: getUserItemWhere(userId, itemId),
		create: {
			userId,
			itemId,
			quantity: count
		},
		update: {
			quantity: {
				increment: count
			}
		}
	});
}

async function removeUserItem(tx: DialogTransaction, context: DialogContext, itemId: number, count: number) {
	assertPositiveCount(count, 'Item count');

	const currentQuantity = context.user.items.get(itemId) ?? 0;

	assertEnoughQuantity(currentQuantity, count, `item ${itemId}`);

	const remainingQuantity = currentQuantity - count;

	if (remainingQuantity <= 0) {
		await tx.userItems.delete({
			where: getUserItemWhere(context.user.id, itemId)
		});

		return;
	}

	await tx.userItems.update({
		where: getUserItemWhere(context.user.id, itemId),
		data: {
			quantity: remainingQuantity
		}
	});
}

async function addUserIngredient(tx: DialogTransaction, userId: string, ingredientId: number, count: number) {
	assertPositiveCount(count, 'Ingredient count');

	await tx.userIngredients.upsert({
		where: getUserIngredientWhere(userId, ingredientId),
		create: {
			userId,
			ingredientId,
			quantity: count
		},
		update: {
			quantity: {
				increment: count
			}
		}
	});
}

async function removeUserIngredient(
	tx: DialogTransaction,
	context: DialogContext,
	ingredientId: number,
	count: number
) {
	assertPositiveCount(count, 'Ingredient count');

	const currentQuantity = context.user.ingredients.get(ingredientId) ?? 0;

	assertEnoughQuantity(currentQuantity, count, `ingredient ${ingredientId}`);

	const remainingQuantity = currentQuantity - count;

	if (remainingQuantity <= 0) {
		await tx.userIngredients.delete({
			where: getUserIngredientWhere(context.user.id, ingredientId)
		});

		return;
	}

	await tx.userIngredients.update({
		where: getUserIngredientWhere(context.user.id, ingredientId),
		data: {
			quantity: remainingQuantity
		}
	});
}

async function removeUserGold(tx: DialogTransaction, context: DialogContext, amount: number) {
	assertPositiveCount(amount, 'Gold amount');

	assertEnoughQuantity(context.user.gold, amount, 'gold');

	await tx.userWallet.update({
		where: { id: context.user.id, type: 'GOLD' },
		data: {
			amount: {
				decrement: amount
			}
		}
	});
}

async function healDinoz(tx: DialogTransaction, context: DialogContext, amount: number) {
	if (!Number.isInteger(amount)) {
		throw new Error(`Heal amount must be an integer, received "${amount}"`);
	}

	const nextLife = Math.max(0, Math.min(context.dinoz.maxLife, context.dinoz.life + amount));

	await tx.dinoz.update({
		where: { id: context.dinoz.id },
		data: {
			life: nextLife
		}
	});
}

function pickRandomItemId(itemIds: number[]): number {
	if (itemIds.length === 0) {
		throw new Error('giveRandomItem requires at least one item id');
	}

	const index = Math.floor(Math.random() * itemIds.length);

	return itemIds[index]!;
}

function getUserRewardWhere(userId: string, rewardId: number) {
	return {
		rewardId_userId: {
			rewardId,
			userId
		}
	};
}

function getDialogRewardId(collectionKey: string): number {
	const rewardId = rewardIdByKey[collectionKey];

	if (!rewardId) {
		throw new Error(`Unknown dialog collection key "${collectionKey}"`);
	}

	return rewardId;
}

async function addUserCollection(tx: DialogTransaction, userId: string, collectionKey: string) {
	const rewardId = getDialogRewardId(collectionKey);

	await tx.userRewards.upsert({
		where: getUserRewardWhere(userId, rewardId),
		create: {
			userId,
			rewardId
		},
		update: {}
	});
}

async function removeUserCollection(tx: DialogTransaction, context: DialogContext, collectionKey: string) {
	const rewardId = getDialogRewardId(collectionKey);

	if (!context.user.collections.has(collectionKey)) {
		throw new ExpectedError(`Collection "${collectionKey}" is not owned by user "${context.user.id}"`);
	}

	await tx.userRewards.delete({
		where: getUserRewardWhere(context.user.id, rewardId)
	});
}

function getDialogStatusId(statusKey: string): number {
	const statusId = dinozStatusIdByKey[statusKey];

	if (!statusId) {
		throw new Error(`Unknown dialog status key "${statusKey}"`);
	}

	return statusId;
}

function notImplemented(message: string): never {
	throw new Error(message);
}

async function applyDialogEffect(
	tx: DialogTransaction,
	context: DialogContext,
	dialogId: string,
	phaseId: string,
	effect: DialogEffect
) {
	switch (effect.type) {
		case 'scenario':
			//await upsertScenarioProgress(tx, context.user.id, effect.scenarioKey, effect.phase);
			return;
		case 'scenarioDelta':
			//await incrementScenarioProgress(tx, context.user.id, effect.scenarioKey, effect.delta);
			return;
		case 'giveItem':
			await addUserItem(tx, context.user.id, effect.itemId, effect.count);
			return;
		case 'giveIngredient':
			await addUserIngredient(tx, context.user.id, effect.ingredientId, effect.count);
			return;
		case 'giveRandomItem': {
			const itemId = pickRandomItemId(effect.itemIds);
			await addUserItem(tx, context.user.id, itemId, 1);
			return;
		}
		case 'heal':
			await healDinoz(tx, context, effect.amount);
			return;
		case 'url':
			// Purement informatif pour le frontend.
			return;
		case 'effect': {
			await addStatusToDinoz(context.dinoz.id, getDialogStatusId(effect.effect));
			return;
		}
		case 'noEffect':
			await removeStatusFromDinoz(context.dinoz.id, getDialogStatusId(effect.effect));
			return;
		case 'collection':
			await addUserCollection(tx, context.user.id, effect.collection);
			return;

		case 'removeCollection':
			await removeUserCollection(tx, context, effect.collection);
			return;
		case 'skill':
		case 'unlockMission':
		case 'friend':
		case 'moveRandom':
		case 'dialect':
		case 'tag':
		case 'removeTag':
		case 'gameVar':
		case 'userVar':
			notImplemented(
				`Dialog effect "${effect.type}" is not implemented yet in phase "${phaseId}" of dialog "${dialogId}"`
			);
	}
}

async function applyDialogSpecial(
	tx: DialogTransaction,
	context: DialogContext,
	dialogId: string,
	phaseId: string,
	special: DialogSpecial
) {
	switch (special.type) {
		case 'useItem':
			await removeUserItem(tx, context, special.itemId, special.count);
			return;

		case 'useIngredient':
			await removeUserIngredient(tx, context, special.ingredientId, special.count);
			return;

		case 'useGold':
			await removeUserGold(tx, context, special.amount);
			return;

		case 'none':
		case 'fight':
		case 'fightGroup':
		case 'missions':
		case 'startFight':
		case 'popup':
		case 'status':
			// Gérés plus tard côté orchestration / frontend / combat.
			return;
	}
}

export async function applyDialogPhaseEffects(tx: DialogTransaction, params: ApplyDialogPhaseEffectsParams) {
	// Comme dans l’esprit MT, on traite d’abord les "use*" qui représentent
	// un coût d’entrée dans la phase, puis on applique les effets de récompense/progression.
	for (const special of params.phase.special) {
		await applyDialogSpecial(tx, params.context, params.dialog.id, params.phase.id, special);
	}

	for (const effect of params.phase.effects) {
		await applyDialogEffect(tx, params.context, params.dialog.id, params.phase.id, effect);
	}
}
