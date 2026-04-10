import { missionList } from '@dinorpg/core/models/missions/data/index.js';
import type { MissionDefinition } from '@dinorpg/core/models/missions/mission.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

const missionByKey = new Map<string, MissionDefinition>();
const missionsByGroup = new Map<string, MissionDefinition[]>();

for (const mission of missionList) {
	missionByKey.set(mission.key, mission);

	const existingGroup = missionsByGroup.get(mission.group) ?? [];
	existingGroup.push(mission);
	missionsByGroup.set(mission.group, existingGroup);
}

export function getMissionDefinitions(): MissionDefinition[] {
	return missionList;
}

export function getMissionDefinitionByKey(missionKey: string): MissionDefinition {
	const mission = missionByKey.get(missionKey);

	if (!mission) {
		throw new ExpectedError(`Unknown mission "${missionKey}"`);
	}

	return mission;
}

export function getMissionDefinitionsByGroup(group: string): MissionDefinition[] {
	const missions = missionsByGroup.get(group);

	if (!missions || missions.length === 0) {
		throw new ExpectedError(`Unknown mission group "${group}"`);
	}

	return missions;
}
