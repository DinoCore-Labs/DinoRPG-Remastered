import type { MissionGroupKey, MissionKey } from './missionKey.js';

export type DinozMissionGroupItem = {
	key: MissionKey;
	group: MissionGroupKey;
	nameKey: string;
	beginKey: string;
	endKey: string;
	limit?: number | null;
	isCompleted: boolean;
	isActive: boolean;
	progression: number | null;
	tracking: number | null;
};

export type DinozMissionGroupResponse = {
	group: MissionGroupKey;
	missions: DinozMissionGroupItem[];
};

export type StartDinozMissionResponse = {
	success: true;
	missionKey: MissionKey;
	progression: number;
	tracking: number;
	isCompleted: boolean;
};
