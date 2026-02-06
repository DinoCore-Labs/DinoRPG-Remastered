export function mulberry32(seed: number) {
	return function () {
		let t = (seed += 0x6d2b79f5);
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export function hashStringToInt(seed: string): number {
	let hash = 0;

	for (let i = 0; i < seed.length; i++) {
		hash = Math.imul(31, hash) + seed.charCodeAt(i);
		hash |= 0; // force int32
	}

	return hash;
}

export type SeededRandom = () => number;

/**
 * xorshift32 — PRNG déterministe, rapide, adapté au jeu
 * Retourne un float ∈ [0, 1[
 */
export const createXorShift32 = (seed: number): SeededRandom => {
	let x = seed | 0;

	// éviter le seed = 0 (xorshift dégénère)
	if (x === 0) x = 0x6d2b79f5;

	return () => {
		x ^= x << 13;
		x ^= x >>> 17;
		x ^= x << 5;
		return (x >>> 0) / 0xffffffff;
	};
};
