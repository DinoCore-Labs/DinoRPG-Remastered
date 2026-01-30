import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';

import { Prisma } from '../../../../prisma/index.js';
import { getRandomUpElement } from './getRandomUpElement.js';

export const initializeDinoz = (
	race: DinozRace,
	userId: string,
	display: string,
	seed?: string
): Prisma.DinozCreateInput => {
	seed = seed ?? crypto.randomUUID();
	return {
		name: '?',
		raceId: race.raceId,
		level: 1,
		placeId: PlaceEnum.DINOVILLE,
		display: display,
		life: 100,
		maxLife: 100,
		experience: 0,
		canRename: true,
		nbrUpFire: race.nbrFire,
		nbrUpWood: race.nbrWood,
		nbrUpWater: race.nbrWater,
		nbrUpLightning: race.nbrLightning,
		nbrUpAir: race.nbrAir,
		nextUpElementId: getRandomUpElement(race.upChance, seed),
		nextUpAltElementId: getRandomUpElement(race.upChance, seed),
		user: { connect: { id: userId } },
		seed: seed
	};
};
