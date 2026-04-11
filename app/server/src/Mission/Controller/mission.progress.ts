import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import type { MissionGoal, MissionKillGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import type { MonsterKey } from '@dinorpg/core/models/monster/monsterKey.js';

import type { Prisma } from '../../../../prisma/client.js';
import { prisma } from '../../prisma.js';
import { getMissionDefinitionByKey } from './mission.registry.js';
import { applyMissionRewards } from './mission.rewards.js';

type MissionTransaction = Prisma.TransactionClient;

export type MissionProgressResult = {
	missionKey: string;
	progression: number;
	tracking: number;
	isCompleted: boolean;
} | null;

type ActiveMissionState = {
	savedMission: {
		missionKey: string;
		progression: number;
		tracking: number;
		isCompleted: boolean;
	};
	definition: MissionDefinition;
	currentGoal: MissionGoal | null;
};

async function getActiveMissionState(tx: MissionTransaction, dinozId: number): Promise<ActiveMissionState | null> {
	const savedMission = await tx.dinozMissions.findFirst({
		where: {
			dinozId,
			isCompleted: false
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});

	if (!savedMission) {
		return null;
	}

	const definition = getMissionDefinitionByKey(savedMission.missionKey);
	const currentGoal = definition.goals[savedMission.progression] ?? null;

	return {
		savedMission,
		definition,
		currentGoal
	};
}

async function finalizeMissionProgress(
	tx: MissionTransaction,
	params: {
		dinozId: number;
		missionKey: string;
		nextProgression: number;
		nextTracking: number;
		definition: MissionDefinition;
	}
): Promise<MissionProgressResult> {
	const isCompleted = params.nextProgression >= params.definition.goals.length;

	const updatedMission = await tx.dinozMissions.update({
		where: {
			missionKey_dinozId: {
				missionKey: params.missionKey,
				dinozId: params.dinozId
			}
		},
		data: {
			progression: params.nextProgression,
			tracking: params.nextTracking,
			isCompleted
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});

	if (isCompleted) {
		await applyMissionRewards(tx, {
			dinozId: params.dinozId,
			definition: params.definition
		});
	}

	console.log('[missions] progress', {
		missionKey: params.missionKey,
		dinozId: params.dinozId,
		nextProgression: params.nextProgression,
		nextTracking: params.nextTracking,
		isCompleted
	});

	return {
		missionKey: updatedMission.missionKey,
		progression: updatedMission.progression,
		tracking: updatedMission.tracking,
		isCompleted: updatedMission.isCompleted
	};
}

function countKilledMatches(goal: MissionKillGoal, defeatedMonsterKeys: MonsterKey[]): number {
	const goalMonsterKeys = goal.kill.monsterKeys;

	if (!goalMonsterKeys || goalMonsterKeys.length === 0) {
		return defeatedMonsterKeys.length;
	}

	return defeatedMonsterKeys.reduce((count, monsterKey) => {
		return goalMonsterKeys.includes(monsterKey) ? count + 1 : count;
	}, 0);
}

export async function advanceDinozMissionOnMove(
	tx: MissionTransaction,
	params: { dinozId: number; place: number }
): Promise<MissionProgressResult> {
	const activeMission = await getActiveMissionState(tx, params.dinozId);

	if (!activeMission || !activeMission.currentGoal) {
		return null;
	}

	const goal = activeMission.currentGoal;

	if (goal.type !== 'AT') {
		return null;
	}

	if (goal.place === null || goal.place !== params.place) {
		return null;
	}

	return finalizeMissionProgress(tx, {
		dinozId: params.dinozId,
		missionKey: activeMission.savedMission.missionKey,
		nextProgression: activeMission.savedMission.progression + 1,
		nextTracking: 0,
		definition: activeMission.definition
	});
}

export async function advanceDinozMissionOnTalk(
	tx: MissionTransaction,
	params: {
		dinozId: number;
		npcKey: string;
	}
): Promise<MissionProgressResult> {
	const activeMission = await getActiveMissionState(tx, params.dinozId);

	if (!activeMission || !activeMission.currentGoal) {
		return null;
	}

	const goal = activeMission.currentGoal;

	if (goal.type !== 'TALK') {
		return null;
	}

	if (!goal.npcKey || goal.npcKey !== params.npcKey) {
		return null;
	}

	return finalizeMissionProgress(tx, {
		dinozId: params.dinozId,
		missionKey: activeMission.savedMission.missionKey,
		nextProgression: activeMission.savedMission.progression + 1,
		nextTracking: 0,
		definition: activeMission.definition
	});
}

export async function advanceDinozMissionOnAction(
	tx: MissionTransaction,
	params: {
		dinozId: number;
		actionKey: string;
	}
): Promise<MissionProgressResult> {
	const activeMission = await getActiveMissionState(tx, params.dinozId);

	if (!activeMission || !activeMission.currentGoal) {
		return null;
	}

	const goal = activeMission.currentGoal;

	if (goal.type !== 'ACTION') {
		return null;
	}

	if (!goal.actionKey || goal.actionKey !== params.actionKey) {
		return null;
	}

	return finalizeMissionProgress(tx, {
		dinozId: params.dinozId,
		missionKey: activeMission.savedMission.missionKey,
		nextProgression: activeMission.savedMission.progression + 1,
		nextTracking: 0,
		definition: activeMission.definition
	});
}

export async function advanceDinozMissionOnFightWon(
	tx: MissionTransaction,
	params: {
		dinozId: number;
		defeatedMonsterKeys: MonsterKey[];
		zone?: number | null;
	}
): Promise<MissionProgressResult> {
	const activeMission = await getActiveMissionState(tx, params.dinozId);

	if (!activeMission || !activeMission.currentGoal) {
		return null;
	}

	const goal = activeMission.currentGoal;

	if (goal.type !== 'KILL') {
		return null;
	}

	if (goal.kill.zone != null && goal.kill.zone !== params.zone) {
		return null;
	}

	const killedCount = countKilledMatches(goal, params.defeatedMonsterKeys);

	if (killedCount <= 0) {
		return null;
	}

	const nextTracking = activeMission.savedMission.tracking + killedCount;

	if (nextTracking < goal.kill.count) {
		return finalizeMissionProgress(tx, {
			dinozId: params.dinozId,
			missionKey: activeMission.savedMission.missionKey,
			nextProgression: activeMission.savedMission.progression,
			nextTracking,
			definition: activeMission.definition
		});
	}

	return finalizeMissionProgress(tx, {
		dinozId: params.dinozId,
		missionKey: activeMission.savedMission.missionKey,
		nextProgression: activeMission.savedMission.progression + 1,
		nextTracking: 0,
		definition: activeMission.definition
	});
}
