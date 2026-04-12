import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import type {
	MissionInteractionCompleteResponse,
	MissionInteractionStartResponse
} from '@dinorpg/core/models/missions/missionInteraction.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { processMissionFight } from '../../Fight/Service/processMissionFight.service.js';
import { prisma } from '../../prisma.js';

type MissionStateRow = {
	id: number;
	missionKey: string;
	progression: number;
	tracking: number;
};

type CompleteMissionInteractionInput = {
	userId: string;
	dinozId: number;
	trigger: 'manual' | 'fight_victory';
};

async function getActiveMissionState(
	userId: string,
	dinozId: number
): Promise<{
	state: MissionStateRow;
	goal: MissionGoal;
} | null> {
	const missionState = await prisma.dinozMissions.findFirst({
		where: {
			dinozId,
			dinoz: {
				userId
			}
		},
		orderBy: {
			id: 'asc'
		},
		select: {
			id: true,
			missionKey: true,
			progression: true,
			tracking: true
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
		state: missionState,
		goal
	};
}

async function advanceMissionState(missionStateId: number, progression: number) {
	await prisma.dinozMissions.update({
		where: {
			id: missionStateId
		},
		data: {
			progression: progression + 1,
			tracking: 0
		}
	});
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
					nameKey: goal.nameKey,
					dialogId: goal.dialogId
				};
			}

			return {
				mode: 'modal',
				goalType: 'TALK',
				npcKey: goal.npcKey,
				nameKey: goal.nameKey,
				textKey: goal.textKey,
				avatar: goal.avatar ?? null,
				frame: goal.frame ?? null,
				background: goal.background ?? null,
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
			if (goal.type !== 'TALK' && goal.type !== 'ACTION') {
				throw new ExpectedError(`Mission goal "${goal.type}" cannot be completed manually.`);
			}
			break;

		case 'fight_victory':
			if (goal.type !== 'FIGHT') {
				throw new ExpectedError(`Mission goal "${goal.type}" cannot be completed from fight victory.`);
			}
			break;

		default:
			throw new ExpectedError('Unknown mission completion trigger.');
	}

	await advanceMissionState(currentMission.state.id, currentMission.state.progression);

	return {
		ok: true
	};
}
