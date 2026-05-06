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

export function resolveCurrentMission(
	missions: DinozMissionState[],
	currentPlaceId?: number | null
): ResolvedCurrentMission | null {
	const activeMission = missions.find(mission => !mission.isCompleted) ?? null;
	if (!activeMission) {
		return null;
	}
	const definition = missionList.find(mission => mission.key === activeMission.missionKey) ?? null;
	if (!definition) {
		throw new ExpectedError(`Unknown mission definition "${activeMission.missionKey}".`);
	}
	const currentGoalIndex = activeMission.progression;
	const persistedCurrentGoal = definition.goals[currentGoalIndex] ?? null;
	const { currentGoal } = resolveDisplayedMissionGoal({
		goals: definition.goals,
		currentGoalIndex,
		currentGoal: persistedCurrentGoal,
		tracking: activeMission.tracking,
		currentPlaceId
	});
	return {
		state: activeMission,
		definition,
		currentGoal
	};
}

export function resolveDisplayedMissionGoal(params: {
	goals: MissionGoal[];
	currentGoalIndex: number;
	currentGoal: MissionGoal | null;
	tracking: number;
	currentPlaceId?: number | null;
}) {
	const { goals, currentGoalIndex, currentGoal, tracking, currentPlaceId } = params;
	if (!currentGoal || currentGoal.type !== 'KILL') {
		return {
			currentGoalIndex,
			currentGoal
		};
	}
	const killPlace = currentGoal.kill.place ?? null;
	if (killPlace === null || currentPlaceId == null || currentPlaceId === killPlace) {
		return {
			currentGoalIndex,
			currentGoal
		};
	}
	if (tracking >= currentGoal.kill.count) {
		return {
			currentGoalIndex,
			currentGoal
		};
	}
	for (let index = currentGoalIndex - 1; index >= 0; index--) {
		const previousGoal = goals[index];
		if (previousGoal.type === 'AT' && previousGoal.place === killPlace) {
			return {
				currentGoalIndex: index,
				currentGoal: previousGoal
			};
		}
	}
	return {
		currentGoalIndex,
		currentGoal
	};
}
