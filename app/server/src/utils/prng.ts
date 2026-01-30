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
