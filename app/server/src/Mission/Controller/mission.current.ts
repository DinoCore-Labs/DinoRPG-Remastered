import type { DinozCurrentMission } from '@dinorpg/core/models/missions/missionCurrent.js';

import type { Prisma } from '../../../../prisma/client.js';
import { getMissionDefinitionByKey } from './mission.registry.js';

type MissionTransaction = Prisma.TransactionClient;

export async function getCurrentDinozMission(
	tx: MissionTransaction,
	dinozId: number
): Promise<DinozCurrentMission | null> {
	const savedMission = await tx.dinozMissions.findFirst({
		where: {
			dinozId,
			isCompleted: false
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true
		}
	});

	if (!savedMission) {
		return null;
	}

	const definition = getMissionDefinitionByKey(savedMission.missionKey);
	const currentGoalIndex = savedMission.progression;
	const currentGoal = definition.goals[currentGoalIndex] ?? null;

	return {
		key: definition.key,
		group: definition.group,
		nameKey: definition.nameKey,
		beginKey: definition.beginKey,
		endKey: definition.endKey,
		progression: savedMission.progression,
		tracking: savedMission.tracking,
		currentGoalIndex,
		currentGoal
	};
}
