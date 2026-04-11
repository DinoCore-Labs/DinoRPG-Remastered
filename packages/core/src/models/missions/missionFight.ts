import { MissionActionKey, MissionBackgroundKey, MissionMonsterKey } from './missionKey.js';

export type MissionFightAction = {
	nameKey: string;
	actionKey?: MissionActionKey;
	monsterKeys?: MissionMonsterKey[] | null;
	allyKeys: MissionMonsterKey[];
	beginText?: string | null;
	beginMonsterKey?: MissionMonsterKey | null;
	winText?: string | null;
	lostText?: string | null;
	background?: MissionBackgroundKey | null;
	timeoutSeconds?: number | null;
};

export type MissionKillInfos = {
	monsterKeys?: MissionMonsterKey[] | null;
	count: number;
	force: boolean;
	zone?: number | null;
	displayNameKey?: string | null;
};
