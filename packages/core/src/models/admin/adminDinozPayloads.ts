import { DinozState } from '../dinoz/dinozState.js';

export interface UpdateAdminDinozProfilePayload {
	name: string;
	canRename: boolean;
	raceId: number;
	display: string;
}

export interface UpdateAdminDinozStatsPayload {
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
	remaining: number;
	order: number | null;
	fight: boolean;
	gather: boolean;
}

export interface UpdateAdminDinozStatePayload {
	state: DinozState | null;
	stateTimer: string | null;
}

export interface TeleportAdminDinozPayload {
	placeId: number;
}

export interface UpdateAdminDinozLeaderPayload {
	leaderId: number | null;
}

export interface AddAdminDinozStatusPayload {
	statusId: number;
}

export interface RemoveAdminDinozStatusPayload {
	statusId: number;
}

export interface AddAdminDinozSkillPayload {
	skillId: number;
	state?: boolean;
}

export interface UpdateAdminDinozSkillStatePayload {
	skillId: number;
	state: boolean;
}

export interface RemoveAdminDinozSkillPayload {
	skillId: number;
}

export interface UpdateAdminDinozItemsPayload {
	entries: {
		itemId: number;
	}[];
}
