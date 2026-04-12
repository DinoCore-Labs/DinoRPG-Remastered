import type { MissionGoal } from './missionGoal.js';
import type { MissionGroupKey, MissionKey } from './missionKey.js';

export type DinozMissionStatus = 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';

export type DinozMissionGroupItem = {
	key: MissionKey;
	group: MissionGroupKey;
	nameKey: string;
	beginKey: string;
	endKey: string;
	limit?: number | null;
	status: DinozMissionStatus;
	canStart: boolean;
	isCompleted: boolean;
	isActive: boolean;
	progression: number | null;
	tracking: number | null;
};

export type DinozMissionGroupResponse = {
	group: MissionGroupKey;
	activeMissionKey: MissionKey | null;
	missions: DinozMissionGroupItem[];
};

export type StartDinozMissionResponse = {
	success: true;
	missionKey: MissionKey;
	progression: number;
	tracking: number;
	isCompleted: boolean;
};

export type StopDinozMissionResponse = {
	success: true;
	missionKey: MissionKey;
	aborted: true;
};

export type DinozMissionDetailResponse = {
	key: MissionKey;
	group: MissionGroupKey;
	nameKey: string;
	beginKey: string;
	endKey: string;
	limit?: number | null;
	status: DinozMissionStatus;
	canStart: boolean;
	isCompleted: boolean;
	isActive: boolean;
	progression: number | null;
	tracking: number | null;
	currentGoalIndex: number | null;
	currentGoal: MissionGoal | null;
};
