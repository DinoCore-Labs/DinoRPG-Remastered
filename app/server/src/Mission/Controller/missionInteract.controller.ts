import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type {
	MissionGoal,
	MissionUseItemGoal,
	MissionUseMoneyGoal,
	MissionValidateGoal
} from '@dinorpg/core/models/missions/missionGoal.js';
import type {
	CompleteMissionInteractionInput,
	MissionInteractionCompleteResponse,
	MissionInteractionStartResponse
} from '@dinorpg/core/models/missions/missionInteraction.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { processMissionFight } from '../../Fight/Service/processMissionFight.service.js';
import { prisma } from '../../prisma.js';
import { removeTreasureTicket } from '../../User/Controller/money.controller.js';
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

async function consumeMissionItemGoal(userId: string, goal: MissionUseItemGoal) {
	const itemId = resolveItemIdFromKey(goal.itemKey);
	const userItem = await prisma.userItems.findUnique({
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
	const currentQuantity = userItem?.quantity ?? 0;
	if (currentQuantity < goal.quantity) {
		throw new ExpectedError('notEnoughItems', {
			params: {
				itemKey: goal.itemKey,
				required: goal.quantity,
				current: currentQuantity
			}
		});
	}
	if (currentQuantity === goal.quantity) {
		await prisma.userItems.delete({
			where: {
				itemId_userId: {
					itemId,
					userId
				}
			}
		});
		return;
	}
	await prisma.userItems.update({
		where: {
			itemId_userId: {
				itemId,
				userId
			}
		},
		data: {
			quantity: {
				decrement: goal.quantity
			}
		}
	});
}

async function consumeMissionMoneyGoal(userId: string, goal: MissionUseMoneyGoal) {
	if (goal.moneyType === 'TREASURE_TICKET') {
		await removeTreasureTicket(userId, goal.quantity);
		return;
	}
	throw new ExpectedError(`Unsupported mission money type "${goal.moneyType}".`);
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

function assertValidateGoalCanBeUsed(goal: MissionValidateGoal, placeId: number) {
	if (goal.place !== null && goal.place !== placeId) {
		throw new ExpectedError(`Mission validation is not available at place "${placeId}".`);
	}
}

async function advanceMissionState(
	currentMission: ActiveMissionState,
	dinozId: number
): Promise<MissionInteractionCompleteResponse> {
	const nextProgression = currentMission.state.progression + 1;
	const isCompleted = nextProgression >= currentMission.definition.goals.length;
	await prisma.$transaction(async tx => {
		await tx.dinozMissions.update({
			where: { id: currentMission.state.id },
			data: {
				progression: nextProgression,
				tracking: 0,
				isCompleted
			}
		});
		if (isCompleted) {
			await applyMissionRewards(tx, {
				dinozId,
				definition: currentMission.definition
			});
		}
	});
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

export async function startMissionInteraction(
	userId: string,
	dinozId: number
): Promise<MissionInteractionStartResponse> {
	const currentMission = await getActiveMissionState(userId, dinozId);
	if (!currentMission) {
		throw new ExpectedError('No active mission for this dinoz.');
	}
	const goal = currentMission.goal;
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
			assertValidateGoalCanBeUsed(goal, currentMission.state.dinozPlaceId);
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
				goal
			});
			return {
				mode: 'fight',
				goalType: 'FIGHT',
				fight
			};
		}
		case 'USE_ITEM':
			return {
				mode: 'modal',
				goalType: 'USE_ITEM',
				nameKey: 'missions.actions.useItem',
				textKey: `missions.items.${goal.itemKey}`
			};
		case 'FIGHT_ACTION': {
			const fight = await processMissionFight({
				userId,
				dinozId,
				goal
			});
			return {
				mode: 'fight',
				goalType: 'FIGHT_ACTION',
				fight
			};
		}
		default:
			throw new ExpectedError(`Mission goal "${goal.type}" is not interactable from Dinoz actions.`);
	}
}

export async function completeMissionInteraction(
	input: CompleteMissionInteractionInput
): Promise<MissionInteractionCompleteResponse> {
	const currentMission = await getActiveMissionState(input.userId, input.dinozId);
	if (!currentMission) {
		throw new ExpectedError('No active mission for this dinoz.');
	}
	const goal = currentMission.goal;
	switch (input.trigger) {
		case 'manual':
			if (
				goal.type !== 'TALK' &&
				goal.type !== 'ACTION' &&
				goal.type !== 'VALIDATE' &&
				goal.type !== 'USE_ITEM' &&
				goal.type !== 'USE_MONEY'
			) {
				throw new ExpectedError(`Mission goal "${goal.type}" cannot be completed manually.`);
			}
			if (goal.type === 'VALIDATE') {
				assertValidateGoalCanBeUsed(goal, currentMission.state.dinozPlaceId);
			}
			if (goal.type === 'USE_ITEM') {
				await consumeMissionItemGoal(input.userId, goal);
			}
			if (goal.type === 'USE_MONEY') {
				await consumeMissionMoneyGoal(input.userId, goal);
			}
			break;
		case 'fight_victory':
			if (goal.type !== 'FIGHT' && goal.type !== 'FIGHT_ACTION') {
				throw new ExpectedError(`Mission goal "${goal.type}" cannot be completed from fight victory.`);
			}
			break;
		default:
			throw new ExpectedError('Unknown mission completion trigger.');
	}
	return advanceMissionState(currentMission, input.dinozId);
}
