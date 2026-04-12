import type { MissionGoal } from './missionGoal.js';
import type { MissionGroupKey, MissionKey } from './missionKey.js';

export type DinozCurrentMission = {
	key: MissionKey;
	group: MissionGroupKey;
	nameKey: string;
	beginKey: string;
	endKey: string;
	progression: number;
	tracking: number;
	currentGoalIndex: number | null;
	currentGoal: MissionGoal | null;
};
