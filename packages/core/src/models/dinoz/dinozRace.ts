import { RaceEnum } from '../enums/Race.js';

export interface DinozRace {
	raceId: RaceEnum;
	isDemon: boolean;
	name: string;
	nbrFire: number;
	nbrWood: number;
	nbrWater: number;
	nbrLightning: number;
	nbrAir: number;
	// Chances are in x out of 20
	// e.g. 5 means 5 chances of out 20 to get that element, i.e 25 %
	upChance: UpChance;
	price: number;
	swfLetter: string;
	skillId?: number[];
}

export interface UpChance {
	fire: number;
	wood: number;
	water: number;
	lightning: number;
	air: number;
}
