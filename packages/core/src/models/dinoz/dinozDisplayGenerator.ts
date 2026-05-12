import type { DinozRace } from './dinozRace.js';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function getBase62Letter(index: number): string {
	return BASE62_CHARS[index] ?? '0';
}

export function getRandomBase62Letter(maxLetter = 'z'): string {
	const maxIndex = BASE62_CHARS.indexOf(maxLetter);

	if (maxIndex === -1) {
		return '0';
	}

	const availableChars = BASE62_CHARS.slice(0, maxIndex + 1);
	return availableChars[Math.floor(Math.random() * availableChars.length)];
}

export function generateDinozDisplaySeed(length = 11): string {
	let result = '';

	for (let i = 0; i < length; i++) {
		result += getRandomBase62Letter('z');
	}

	return result;
}

export function buildDinozDisplay(input: {
	race: DinozRace;
	seed?: string;
	palette: string;
	rare1: string;
	rare2: string;
}): string {
	const seed = input.seed && input.seed.length === 11 ? input.seed : generateDinozDisplaySeed();

	return `${input.race.swfLetter}${seed}${input.palette}${input.rare1}${input.rare2}`;
}

export function parseDinozDisplay(display: string) {
	return {
		raceCode: display.slice(0, 2),
		seed: display.slice(2, 13),
		palette: display.slice(13, 14),
		rare1: display.slice(14, 15),
		rare2: display.slice(15, 16)
	};
}
