import { UpChance } from '@dinorpg/core/models/dinoz/dinozRace.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { hashStringToInt, mulberry32 } from '../prng.js';

export const getRandomUpElement = (raceUpChance: UpChance, seed?: string) => {
	const totalUpChance = Object.values(raceUpChance).reduce((total, currentValue) => total + currentValue, 0);
	let random: number;
	if (seed) {
		const hashedSeed = hashStringToInt(seed);
		const rng = mulberry32(hashedSeed);
		random = rng();
	} else {
		random = Math.random();
	}

	const randomNumber = Math.ceil(random * totalUpChance);

	let total = 0;

	for (const [index, elementValue] of Object.values(raceUpChance).entries()) {
		total += elementValue;
		if (randomNumber <= total) {
			return index + 1;
		}
	}

	throw new ExpectedError(`Random number ${randomNumber} is not in range of total ${totalUpChance}`);
};
