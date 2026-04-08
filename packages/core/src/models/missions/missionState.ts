import { MissionKey } from './missionKey.js';

export type MissionStatePrimitive = string | number | boolean | null;
export type MissionStateValue = MissionStatePrimitive | MissionStateValue[] | { [key: string]: MissionStateValue };

export type MissionRuntimeState = {
	missionKey: MissionKey;
	progression: number;
	tracking: number;
	isCompleted: boolean;
	state?: MissionStateValue | null;
};

export type MissionProgressSnapshot = {
	progression: number;
	tracking: number;
	isCompleted: boolean;
	state?: MissionStateValue | null;
};
