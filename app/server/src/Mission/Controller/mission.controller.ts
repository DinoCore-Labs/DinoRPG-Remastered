import type { DinozMissionGroupResponse, DinozMissionStatus } from '@dinorpg/core/models/missions/missionResponse.js';

import type { Prisma } from '../../../../prisma/client.js';
import { assertOwnedDinoz } from './mission.access.js';
import { getMissionDefinitionsByGroup } from './mission.registry.js';
import { checkMissionStartCondition } from './mission.startConditions.js';

type MissionTransaction = Prisma.TransactionClient;

export async function getDinozMissionGroup(
	tx: MissionTransaction,
	params: {
		userId: string;
		dinozId: number;
		group: string;
	}
): Promise<DinozMissionGroupResponse> {
	const dinoz = await assertOwnedDinoz(tx, params.userId, params.dinozId);

	const definitions = getMissionDefinitionsByGroup(params.group);

	const savedMissions = await tx.dinozMissions.findMany({
		where: {
			dinozId: params.dinozId,
			missionKey: {
				in: definitions.map(definition => definition.key)
			}
		},
		select: {
			missionKey: true,
			progression: true,
			tracking: true,
			isCompleted: true
		}
	});

	const savedMissionByKey = new Map(savedMissions.map(mission => [mission.missionKey, mission]));
	const activeMissionKey = savedMissions.find(mission => !mission.isCompleted)?.missionKey ?? null;

	const missions = [];

	for (const definition of definitions) {
		const savedMission = savedMissionByKey.get(definition.key);

		if (savedMission?.isCompleted) {
			missions.push({
				key: definition.key,
				group: definition.group,
				nameKey: definition.nameKey,
				beginKey: definition.beginKey,
				endKey: definition.endKey,
				limit: definition.limit ?? null,
				status: 'COMPLETED' as DinozMissionStatus,
				canStart: false,
				isCompleted: true,
				isActive: false,
				progression: savedMission.progression,
				tracking: savedMission.tracking
			});
			continue;
		}

		if (savedMission && !savedMission.isCompleted) {
			missions.push({
				key: definition.key,
				group: definition.group,
				nameKey: definition.nameKey,
				beginKey: definition.beginKey,
				endKey: definition.endKey,
				limit: definition.limit ?? null,
				status: 'IN_PROGRESS' as DinozMissionStatus,
				canStart: false,
				isCompleted: false,
				isActive: true,
				progression: savedMission.progression,
				tracking: savedMission.tracking
			});
			continue;
		}

		const isUnlocked = await checkMissionStartCondition(tx, {
			dinoz,
			condition: definition.condition
		});

		const status: DinozMissionStatus = isUnlocked ? 'AVAILABLE' : 'LOCKED';
		const canStart = isUnlocked && activeMissionKey === null;

		missions.push({
			key: definition.key,
			group: definition.group,
			nameKey: definition.nameKey,
			beginKey: definition.beginKey,
			endKey: definition.endKey,
			limit: definition.limit ?? null,
			status,
			canStart,
			isCompleted: false,
			isActive: false,
			progression: null,
			tracking: null
		});
	}

	return {
		group: params.group,
		activeMissionKey,
		missions
	};
}
