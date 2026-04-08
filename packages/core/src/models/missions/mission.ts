import { MissionConditionSource } from './missionCondition.js';
import { MissionGoal } from './missionGoal.js';
import { MissionGroupKey, MissionKey, MissionLabelKey } from './missionKey.js';
import { MissionReward } from './missionReward.js';

export type MissionLabels = Partial<Record<MissionLabelKey, number>>;

export type MissionDefinition = {
	key: MissionKey;
	group: MissionGroupKey;
	name: string;
	begin: string;
	end: string;
	goals: MissionGoal[];
	rewards: MissionReward[];
	labels: MissionLabels;
	condition?: MissionConditionSource | null;
	limit?: number | null;
};
