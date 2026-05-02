import { DinozState } from './dinozState.js';
import { DinozStatusDTO } from './dinozStatus.js';

export interface ManageDinozFiche {
	id: number;
	name: string;
	display: string;
	state: DinozState | null;
	level: number;
	life: number;
	maxLife: number;
	experience: number;
	maxExperience: number;
	order: number | null;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	status: DinozStatusDTO[];
}

export type ManageDinozPageData = ManageDinozFiche[];
