import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type {
	MissionGoal,
	MissionUseIngredientGoal,
	MissionUseItemGoal,
	MissionUseMoneyGoal
} from '@dinorpg/core/models/missions/missionGoal.js';
import type {
	CompleteMissionInteractionInput,
	MissionInteractionCompleteResponse,
	MissionInteractionStartResponse
} from '@dinorpg/core/models/missions/missionInteraction.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { Prisma } from '../../../../prisma/index.js';
import { processMissionFight } from '../../Fight/Service/processMissionFight.service.js';
import { prisma } from '../../prisma.js';
import { removeMoneyTx, removeTreasureTicketTx } from '../../User/Controller/money.controller.js';
import { applyMissionRewards } from './mission.rewards.js';

type MissionStateRow = {
	id: number;
	missionKey: string;
	progression: number;
	tracking: number;
	dinozPlaceId: number;
};

type ActiveMissionState = {
	state: MissionStateRow;
	definition: MissionDefinition;
	goal: MissionGoal;
};

function resolveItemIdFromKey(itemKey: string): number {
	const item = Object.values(itemList).find(entry => entry.name === itemKey);
	if (!item) {
		throw new ExpectedError(`Unknown mission item key "${itemKey}".`);
	}
	return item.itemId;
}

async function consumeMissionItemGoal(tx: Prisma.TransactionClient, userId: string, goal: MissionUseItemGoal) {
	const itemId = resolveItemIdFromKey(goal.itemKey);
	const consumed = await tx.userItems.updateMany({
		where: {
			userId,
			itemId,
			quantity: {
				gte: goal.quantity
			}
		},
		data: {
			quantity: {
				decrement: goal.quantity
			}
		}
	});
	if (consumed.count !== 1) {
		const item = await tx.userItems.findUnique({
			where: {
				itemId_userId: {
					itemId,
					userId
				}
			},
			select: {
				quantity: true
			}
		});
		throw new ExpectedError('notEnoughItems', {
			params: {
				itemKey: goal.itemKey,
				required: goal.quantity,
				current: item?.quantity ?? 0
			}
		});
	}
	await tx.userItems.deleteMany({
		where: {
			userId,
			itemId,
			quantity: 0
		}
	});
}

function resolveIngredientIdFromKey(ingredientKey: string): number {
	const ingredient = Object.values(ingredientList).find(entry => entry.name === ingredientKey);
	if (!ingredient) {
		throw new ExpectedError(`Unknown mission ingredient key "${ingredientKey}".`);
	}
	return ingredient.ingredientId;
}

async function consumeMissionIngredientGoal(
	tx: Prisma.TransactionClient,
	userId: string,
	goal: MissionUseIngredientGoal
) {
	const ingredientId = resolveIngredientIdFromKey(goal.ingredientKey);
	const consumed = await tx.userIngredients.updateMany({
		where: {
			userId,
			ingredientId,
			quantity: {
				gte: goal.quantity
			}
		},
		data: {
			quantity: {
				decrement: goal.quantity
			}
		}
	});
	if (consumed.count !== 1) {
		const ingredient = await tx.userIngredients.findUnique({
			where: {
				ingredientId_userId: {
					ingredientId,
					userId
				}
			},
			select: {
				quantity: true
			}
		});
		throw new ExpectedError('notEnoughItems', {
			params: {
				ingredientKey: goal.ingredientKey,
				required: goal.quantity,
				current: ingredient?.quantity ?? 0
			}
		});
	}
	await tx.userIngredients.deleteMany({
		where: {
			userId,
			ingredientId,
			quantity: 0
		}
	});
}

async function consumeMissionMoneyGoal(tx: Prisma.TransactionClient, userId: string, goal: MissionUseMoneyGoal) {
	switch (goal.moneyType) {
		case 'GOLD':
			await removeMoneyTx(tx, userId, goal.quantity);
			return;
		case 'TREASURE_TICKET':
			await removeTreasureTicketTx(tx, userId, goal.quantity);
			return;
	}
}

async function getActiveMissionState(userId: string, dinozId: number): Promise<ActiveMissionState | null> {
	const missionState = await prisma.dinozMissions.findFirst({
		where: {
			dinozId,
			isCompleted: false,
			dinoz: { userId }
		},
		orderBy: { id: 'asc' },
		select: {
			id: true,
			missionKey: true,
			progression: true,
			tracking: true,
			dinoz: {
				select: {
					placeId: true
				}
			}
		}
	});
	if (!missionState) {
		return null;
	}
	const missionDefinition = missionList.find(mission => mission.key === missionState.missionKey) ?? null;
	if (!missionDefinition) {
		throw new ExpectedError(`Unknown mission definition "${missionState.missionKey}".`);
	}
	const goal = missionDefinition.goals[missionState.progression] ?? null;
	if (!goal) {
		throw new ExpectedError(
			`No goal found for progression ${missionState.progression} in "${missionState.missionKey}".`
		);
	}
	return {
		state: {
			id: missionState.id,
			missionKey: missionState.missionKey,
			progression: missionState.progression,
			tracking: missionState.tracking,
			dinozPlaceId: missionState.dinoz.placeId
		},
		definition: missionDefinition,
		goal
	};
}

function assertMissionGoalCanBeUsedAtPlace(goal: MissionGoal, placeId: number) {
	switch (goal.type) {
		case 'TALK':
		case 'ACTION':
		case 'VALIDATE':
		case 'USE_ITEM':
		case 'USE_MONEY':
		case 'USE_INGREDIENT':
			if (goal.place != null && goal.place !== placeId) {
				throw new ExpectedError(`Mission action is not available at place "${placeId}".`);
			}
			break;
	}
}

async function advanceMissionStateOnceTx(
	tx: Prisma.TransactionClient,
	currentMission: ActiveMissionState,
	dinozId: number
): Promise<MissionInteractionCompleteResponse> {
	const nextProgression = currentMission.state.progression + 1;
	const isCompleted = nextProgression >= currentMission.definition.goals.length;
	const updated = await tx.dinozMissions.updateMany({
		where: {
			id: currentMission.state.id,
			progression: currentMission.state.progression,
			isCompleted: false
		},
		data: {
			progression: nextProgression,
			tracking: 0,
			isCompleted
		}
	});
	if (updated.count !== 1) {
		throw new ExpectedError('Mission has already progressed.');
	}
	if (isCompleted) {
		await applyMissionRewards(tx, {
			dinozId,
			definition: currentMission.definition
		});
	}
	return {
		ok: true,
		completed: isCompleted,
		rewardModal: isCompleted
			? {
					missionKey: currentMission.definition.key,
					missionNameKey: currentMission.definition.nameKey,
					endKey: currentMission.definition.endKey,
					rewards: currentMission.definition.rewards
				}
			: null
	};
}

function advanceMissionStateOnce(currentMission: ActiveMissionState, dinozId: number) {
	return prisma.$transaction(tx => advanceMissionStateOnceTx(tx, currentMission, dinozId));
}

export async function startMissionInteraction(
	userId: string,
	dinozId: number,
	autoReequip?: boolean
): Promise<MissionInteractionStartResponse> {
	const currentMission = await getActiveMissionState(userId, dinozId);
	if (!currentMission) {
		throw new ExpectedError('No active mission for this dinoz.');
	}
	const goal = currentMission.goal;
	assertMissionGoalCanBeUsedAtPlace(goal, currentMission.state.dinozPlaceId);
	switch (goal.type) {
		case 'TALK': {
			if (goal.display === 'dialog') {
				return {
					mode: 'dialog',
					goalType: 'TALK',
					npcKey: goal.npcKey,
					npcNameKey: goal.npcNameKey,
					nameKey: goal.nameKey,
					dialogId: goal.dialogId,
					textKey: goal.textKey,
					gfx: goal.gfx ?? null,
					dialect: goal.dialect ?? null
				};
			}
			return {
				mode: 'modal',
				goalType: 'TALK',
				npcKey: goal.npcKey,
				nameKey: goal.nameKey,
				textKey: goal.textKey,
				avatar: goal.avatar ?? null,
				dialect: goal.dialect ?? null
			};
		}
		case 'ACTION':
			return {
				mode: 'modal',
				goalType: 'ACTION',
				nameKey: goal.nameKey,
				textKey: goal.descriptionKey
			};
		case 'VALIDATE': {
			return {
				mode: 'modal',
				goalType: 'VALIDATE',
				npcKey: goal.npcKey,
				nameKey: goal.nameKey
			};
		}
		case 'FIGHT': {
			const fight = await processMissionFight({
				userId,
				dinozId,
				goal,
				autoReequip
			});
			const completion = fight.result ? await advanceMissionStateOnce(currentMission, dinozId) : null;
			return {
				mode: 'fight',
				goalType: 'FIGHT',
				fight: {
					...fight,
					missionCompletion: completion
				}
			};
		}
		case 'USE_ITEM':
			return {
				mode: 'modal',
				goalType: 'USE_ITEM',
				nameKey: 'missions.actions.useItem',
				textKey: `missions.items.${goal.itemKey}`
			};
		case 'USE_MONEY':
			return {
				mode: 'modal',
				goalType: 'USE_MONEY',
				nameKey: 'goal.nameKey'
			};
		case 'USE_INGREDIENT':
			return {
				mode: 'modal',
				goalType: 'USE_INGREDIENT',
				nameKey: 'goal.nameKey',
				textKey: `missions.ingredients.${goal.ingredientKey}`
			};
		case 'FIGHT_ACTION': {
			const fight = await processMissionFight({
				userId,
				dinozId,
				goal,
				autoReequip
			});
			const completion = fight.result ? await advanceMissionStateOnce(currentMission, dinozId) : null;
			return {
				mode: 'fight',
				goalType: 'FIGHT_ACTION',
				fight: {
					...fight,
					missionCompletion: completion
				}
			};
		}
		default:
			throw new ExpectedError(`Mission goal "${goal.type}" is not interactable from Dinoz actions.`);
	}
}

export async function completeMissionInteraction(
	input: CompleteMissionInteractionInput
): Promise<MissionInteractionCompleteResponse> {
	return prisma.$transaction(async tx => {
		const currentMission = await getActiveMissionState(input.userId, input.dinozId);
		if (!currentMission) {
			throw new ExpectedError('No active mission for this dinoz.');
		}
		const goal = currentMission.goal;
		assertMissionGoalCanBeUsedAtPlace(goal, currentMission.state.dinozPlaceId);
		switch (input.trigger) {
			case 'manual':
				if (
					goal.type !== 'TALK' &&
					goal.type !== 'ACTION' &&
					goal.type !== 'VALIDATE' &&
					goal.type !== 'USE_ITEM' &&
					goal.type !== 'USE_MONEY' &&
					goal.type !== 'USE_INGREDIENT'
				) {
					throw new ExpectedError(`Mission goal "${goal.type}" cannot be completed manually.`);
				}
				if (goal.type === 'USE_ITEM') {
					await consumeMissionItemGoal(tx, input.userId, goal);
				}
				if (goal.type === 'USE_INGREDIENT') {
					await consumeMissionIngredientGoal(tx, input.userId, goal);
				}
				if (goal.type === 'USE_MONEY') {
					await consumeMissionMoneyGoal(tx, input.userId, goal);
				}
				break;
			case 'fight_victory':
				throw new ExpectedError('fight_victory is deprecated. Fight goals are completed by the fight result.');
		}
		return advanceMissionStateOnceTx(tx, currentMission, input.dinozId);
	});
}
