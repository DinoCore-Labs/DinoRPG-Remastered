import { levelList } from '../models/dinoz/dinozLevel.js';
import { DinozForMaxXp } from '../models/dinoz/dinozXP.js';
import { raceList } from '../models/dinoz/raceList.js';
import { DinozStatusId } from '../models/dinoz/statusList.js';
import { placeList } from '../models/place/placeList.js';
import { ExpectedError } from '../models/utils/expectedError.js';

export const getRace = (raceId: number) => {
	const race = Object.values(raceList).find(r => r.raceId === raceId);

	if (!race) {
		throw new ExpectedError(`Race ${raceId} doesn't exist.`);
	}

	return race;
};

export const getMaxXp = (dinoz: DinozForMaxXp): number => {
	const level = levelList.find(l => l.id === dinoz.level);
	if (!level) throw new Error(`Level ${dinoz.level} doesn't exist.`);

	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_3) && dinoz.level === 70) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_2) && dinoz.level === 60) return 0;
	if (dinoz.status.some(s => s.statusId !== DinozStatusId.BROKEN_LIMIT_1) && dinoz.level === 50) return 0;

	return level.experience;
};

export type HasPlaceId = { placeId: number };

export const actualPlace = (dinoz: HasPlaceId) => {
	const place = Object.values(placeList).find(p => p.placeId === dinoz.placeId);

	if (!place) {
		throw new Error(`Place ${dinoz.placeId} doesn't exist.`);
	}

	return place;
};
