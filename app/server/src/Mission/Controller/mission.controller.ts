import { DinozMissionGroupResponse } from '@dinorpg/core/models/missions/missionResponse.js';

import { Prisma } from '../../../../prisma/client.js';
import { assertOwnedDinoz } from './mission.access.js';
import { getMissionDefinitionsByGroup } from './mission.registry.js';

type MissionTransaction = Prisma.TransactionClient;

export async function getDinozMissionGroup(
	tx: MissionTransaction,
	params: {
		userId: string;
		dinozId: number;
		group: string;
	}
): Promise<DinozMissionGroupResponse> {
	await assertOwnedDinoz(tx, params.userId, params.dinozId);

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

	return {
		group: params.group,
		missions: definitions.map(definition => {
			const savedMission = savedMissionByKey.get(definition.key);

			return {
				key: definition.key,
				group: definition.group,
				nameKey: definition.nameKey,
				beginKey: definition.beginKey,
				endKey: definition.endKey,
				limit: definition.limit ?? null,
				isCompleted: savedMission?.isCompleted ?? false,
				isActive: activeMissionKey === definition.key,
				progression: savedMission?.progression ?? null,
				tracking: savedMission?.tracking ?? null
			};
		})
	};
}
