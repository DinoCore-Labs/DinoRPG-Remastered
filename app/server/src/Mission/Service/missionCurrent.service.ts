import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import type { MissionGoal } from '@dinorpg/core/models/missions/missionGoal.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import type { DinozMissions } from '../../../../prisma/index.js';

export type DinozMissionState = Pick<DinozMissions, 'id' | 'missionKey' | 'progression' | 'tracking' | 'isCompleted'>;

export type ResolvedCurrentMission = {
	state: DinozMissionState;
	definition: (typeof missionList)[number];
	currentGoal: MissionGoal | null;
};

export function resolveCurrentMission(missions: DinozMissionState[]): ResolvedCurrentMission | null {
	const activeMission = missions.find(mission => !mission.isCompleted) ?? null;

	if (!activeMission) {
		return null;
	}

	const definition = missionList.find(mission => mission.key === activeMission.missionKey) ?? null;

	if (!definition) {
		throw new ExpectedError(`Unknown mission definition "${activeMission.missionKey}".`);
	}

	const currentGoal = definition.goals[activeMission.progression] ?? null;

	return {
		state: activeMission,
		definition,
		currentGoal
	};
}
