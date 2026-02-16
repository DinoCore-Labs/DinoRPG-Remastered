import { DinozRace } from '@dinorpg/core/models/dinoz/dinozRace.js';

/**
 * @summary Return a random number between min and max - 1
 * @param min {number}
 * @param max {number}
 * @return number
 */
function getRandomNumber(min: number, max: number) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min;
}

/**
 * @summary Return a random letter between '0' and the maximum letter provided
 * 			it must be part of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
 * @param maxLetter {string}
 * @return string
 */
function getRandomLetter(maxLetter: string): string {
	const allLetters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const lettersAvailable: string = allLetters.substring(0, allLetters.indexOf(maxLetter) + 1);

	return lettersAvailable[Math.floor(Math.random() * lettersAvailable.length)];
}

/**
 * @summary Returns a random string of a given size.
 *
 * @param length {number}
 * @return string
 */
function generateString(length: number): string {
	let result = '';
	const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	const charactersLength = characters.length;
	let counter = 0;
	while (counter < length) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
		counter += 1;
	}
	return result;
}

/**
 * @summary Return the letter that corresponds to the provided index
 * 			The letter will be part of '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
 * @return string
 */
function getLetter(index: number): string {
	const allLetters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	return allLetters[index];
}

export function fromBase62(s: string) {
	const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	let result = 0;
	for (let i = 0; i < s.length; i++) {
		const p = digits.indexOf(s[i]);
		if (p < 0) {
			return NaN;
		}
		result += p * Math.pow(digits.length, s.length - i - 1);
	}
	return result;
}

export { generateString, getLetter, getRandomLetter, getRandomNumber };
