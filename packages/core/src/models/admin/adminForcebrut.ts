export interface AdminForcebrutOpponent {
	id: number;
	step: number;
	name: string;
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
	skillIds: number[];
	itemIds: number[];
	statusIds: number[];
	enabled: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface AdminForcebrutOpponentPayload {
	step: number;
	name: string;
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
	skillIds: number[];
	itemIds: number[];
	statusIds: number[];
	enabled: boolean;
}
