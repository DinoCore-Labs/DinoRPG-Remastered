import type { DinozState } from '../dinoz/dinozState.js';

export interface AdminDinozStatusEntry {
	id: number;
	statusId: number;
}

export interface AdminDinozSkillEntry {
	id: number;
	skillId: number;
	state: boolean;
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
	order: number | null;

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
	items: AdminDinozItemEntry[];
	followers: AdminDinozFollowerEntry[];
}

export interface UpdateAdminDinozBody {
	name?: string;
	canRename?: boolean;
	raceId?: number;
	display?: string;

	level?: number;
	life?: number;
	maxLife?: number;
	experience?: number;

	nbrUpFire?: number;
	nbrUpWood?: number;
	nbrUpWater?: number;
	nbrUpLightning?: number;
	nbrUpAir?: number;

	nextUpElementId?: number;
	nextUpAltElementId?: number;

	placeId?: number;
	remaining?: number;
	order?: number | null;

	seed?: string;

	state?: DinozState | null;
	stateTimer?: string | null;

	fight?: boolean;
	gather?: boolean;

	leaderId?: number | null;
}
