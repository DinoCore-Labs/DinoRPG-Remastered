import { MonsterHuntPresetKey, MonsterHuntStatus } from '../monsterHunt/monsterHunt.js';

export interface AdminMonsterHuntPreset {
	key: MonsterHuntPresetKey;
	slug: string;
	nameKey: string;
}

export interface AdminMonsterHuntEdition {
	id: string;
	name: string;
	slug: string;

	status: MonsterHuntStatus;

	startAt: string;
	endAt: string;

	participants: number;
	points: number;
	objects: number;
	kills: number;

	startNewsPublished: boolean;
	endNewsPublished: boolean;
}

export interface AdminMonsterHuntOverview {
	presets: AdminMonsterHuntPreset[];
	editions: AdminMonsterHuntEdition[];
}

export interface AdminCreateMonsterHuntPayload {
	presetKey: MonsterHuntPresetKey;
	startAt: string;
	endAt: string;
}

export interface AdminMonsterHuntActionResponse {
	message: string;
}
