import { DinozState } from '../dinoz/dinozState.js';
import type { MissionGoal } from '../missions/missionGoal.js';
import type { MissionGroupKey } from '../missions/missionKey.js';
import type { MissionStateValue } from '../missions/missionState.js';

export interface AdminDinozStatusEntry {
	id: number;
	statusId: number;
}

export interface AdminDinozSkillEntry {
	id: number;
	skillId: number;
	state: boolean;
}

export interface AdminDinozUnlockableSkillEntry {
	id: number;
	skillId: number;
}

export interface AdminDinozItemEntry {
	id: number;
	itemId: number;
}

export interface AdminDinozFollowerEntry {
	id: number;
	name: string;
	level: number;
}

export interface AdminDinozLeaderOption {
	id: number;
	name: string;
	level: number;
}

export interface AdminDinozMissionEntry {
	id: number;
	missionKey: string;
	group: MissionGroupKey | null;
	nameKey: string | null;
	beginKey: string | null;
	endKey: string | null;
	progression: number;
	tracking: number;
	goalCount: number | null;
	isCompleted: boolean;
	isCurrent: boolean;
	state: MissionStateValue | null;
	currentGoalIndex: number | null;
	currentGoal: MissionGoal | null;
	startedAt: string;
	createdAt: string;
	updatedAt: string;
}

export interface AdminDinozDetails {
	id: number;
	userId: string;
	userName: string | null;
	name: string;
	canRename: boolean;
	raceId: number;
	display: string;
	level: number;
	life: number;
	maxLife: number;
	experience: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	nextUpElementId: number;
	nextUpAltElementId: number;
	placeId: number;
	remaining: number;
	seed: string;
	state: DinozState | null;
	stateTimer: string | null;
	fight: boolean;
	gather: boolean;
	leaderId: number | null;
	createdDate: string;
	updatedDate: string;
	status: AdminDinozStatusEntry[];
	skills: AdminDinozSkillEntry[];
	unlockableSkills: AdminDinozUnlockableSkillEntry[];
	items: AdminDinozItemEntry[];
	followers: AdminDinozFollowerEntry[];
	leaderOptions: AdminDinozLeaderOption[];
	missions: AdminDinozMissionEntry[];
	currentMission: AdminDinozMissionEntry | null;
}
