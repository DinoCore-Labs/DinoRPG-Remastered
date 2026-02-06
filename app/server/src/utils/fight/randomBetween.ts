import { SeededRandom } from '../prng.js';

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (included)
 */
const randomBetween = (min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(Math.random() * (max - min + 1) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (included)
 * using a seeded random generator
 */
export const randomBetweenSeeded = (random: SeededRandom, min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(random() * (max - min + 1) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (excluded)
 */
export const randomBetweenMaxExcluded = (min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(Math.random() * (max - min) + min);
};

/**
 * INTEGERS ONLY
 *
 * Returns a random integer between min and max (excluded)
 * using a seeded random generator
 */
export const randomBetweenMaxExcludedSeeded = (random: SeededRandom, min: number, max: number) => {
	if (min > max) return 0;
	if (min === max) return min;
	return Math.floor(random() * (max - min) + min);
};

export default randomBetween;
