import { randomUUID } from 'node:crypto';

import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';

import { prisma } from '../../../src/prisma.js';

export interface CreateTestDinozOptions {
	userId: string;
	name?: string;
	raceId?: RaceEnum;
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
	nextUpElementId?: ElementType;
	nextUpAltElementId?: ElementType;
	placeId?: PlaceEnum;
	remaining?: number;
	canRename?: boolean;
	fight?: boolean;
	gather?: boolean;
	order?: number | null;
	seed?: string;
}

let dinozSequence = 0;

export async function createTestDinoz(options: CreateTestDinozOptions) {
	dinozSequence += 1;
	const raceId = options.raceId ?? RaceEnum.MOUEFFE;
	const race = raceList[raceId];
	const {
		userId,
		name = `TestDinoz${dinozSequence}`,
		display = `${race.swfLetter}00000000000000`,
		level = 1,
		life = 100,
		maxLife = 100,
		experience = 0,
		nbrUpFire = race.nbrFire,
		nbrUpWood = race.nbrWood,
		nbrUpWater = race.nbrWater,
		nbrUpLightning = race.nbrLightning,
		nbrUpAir = race.nbrAir,
		nextUpElementId = ElementType.FIRE,
		nextUpAltElementId = ElementType.WOOD,
		placeId = PlaceEnum.DINOVILLE,
		remaining = 3,
		canRename = true,
		fight = true,
		gather = true,
		order = null,
		seed = randomUUID()
	} = options;
	return prisma.dinoz.create({
		data: {
			name,
			raceId,
			display,
			level,
			life,
			maxLife,
			experience,
			nbrUpFire,
			nbrUpWood,
			nbrUpWater,
			nbrUpLightning,
			nbrUpAir,
			nextUpElementId,
			nextUpAltElementId,
			placeId,
			remaining,
			canRename,
			fight,
			gather,
			order,
			seed,
			user: {
				connect: {
					id: userId
				}
			}
		}
	});
}
