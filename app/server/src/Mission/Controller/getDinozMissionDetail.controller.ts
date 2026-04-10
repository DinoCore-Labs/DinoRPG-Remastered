import type { DinozMissionDetailResponse, DinozMissionStatus } from '@dinorpg/core/models/missions/missionResponse.js';

import type { Prisma } from '../../../../prisma/client.js';
import { assertOwnedDinoz } from './mission.access.js';
import { getMissionDefinitionByKey } from './mission.registry.js';
import { checkMissionStartCondition } from './mission.startConditions.js';

type MissionTransaction = Prisma.TransactionClient;

export async function getDinozMissionDetail(
	tx: MissionTransaction,
	params: {
		userId: string;
		dinozId: number;
		missionKey: string;
	}
): Promise<DinozMissionDetailResponse> {
	const dinoz = await assertOwnedDinoz(tx, params.userId, params.dinozId);
	const definition = getMissionDefinitionByKey(params.missionKey);

	const savedMission = await tx.dinozMissions.findUnique({
		where: {
			missionKey_dinozId: {
				missionKey: params.missionKey,
				dinozId: params.dinozId
			}
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});

	const activeMission = await tx.dinozMissions.findFirst({
		where: {
			dinozId: params.dinozId,
			isCompleted: false
		},
		select: {
			missionKey: true
		}
	});

	if (savedMission?.isCompleted) {
		return {
			key: definition.key,
			group: definition.group,
			nameKey: definition.nameKey,
			beginKey: definition.beginKey,
			endKey: definition.endKey,
			limit: definition.limit ?? null,
			status: 'COMPLETED',
			canStart: false,
			isCompleted: true,
			isActive: false,
			progression: savedMission.progression,
			tracking: savedMission.tracking,
			currentGoalIndex: null,
			currentGoal: null
		};
	}

	if (savedMission && !savedMission.isCompleted) {
		const currentGoalIndex = savedMission.progression;
		const currentGoal = definition.goals[currentGoalIndex] ?? null;

		return {
			key: definition.key,
			group: definition.group,
			nameKey: definition.nameKey,
			beginKey: definition.beginKey,
			endKey: definition.endKey,
			limit: definition.limit ?? null,
			status: 'IN_PROGRESS',
			canStart: false,
			isCompleted: false,
			isActive: true,
			progression: savedMission.progression,
			tracking: savedMission.tracking,
			currentGoalIndex,
			currentGoal
		};
	}

	const isUnlocked = await checkMissionStartCondition(tx, {
		dinoz,
		condition: definition.condition
	});

	const status: DinozMissionStatus = isUnlocked ? 'AVAILABLE' : 'LOCKED';

	return {
		key: definition.key,
		group: definition.group,
		nameKey: definition.nameKey,
		beginKey: definition.beginKey,
		endKey: definition.endKey,
		limit: definition.limit ?? null,
		status,
		canStart: isUnlocked && activeMission === null,
		isCompleted: false,
		isActive: false,
		progression: null,
		tracking: null,
		currentGoalIndex: null,
		currentGoal: null
	};
}
