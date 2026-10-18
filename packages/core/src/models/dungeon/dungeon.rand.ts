export class MtRand {
	private seed: number;

	constructor(seed: number) {
		if (!Number.isInteger(seed) || Math.abs(seed) > 0x3fffffff) {
			throw new RangeError('MT random seed must be a signed 30-bit integer');
		}
		this.seed = Math.abs(seed) + 131;
	}

	/** Original mt.Rand.initSeed(n, k=5). */
	initSeed(seed: number, rounds = 5): void {
		if (!Number.isInteger(seed) || !Number.isInteger(rounds) || rounds < 0 || rounds > 100) {
			throw new RangeError('Invalid MT random seed or hash rounds');
		}
		let n = seed | 0;
		for (let i = 0; i < rounds; i++) {
			n ^= (n << 7) & 0x2b5b2500;
			n ^= (n << 15) & 0x1b8b0000;
			n ^= n >>> 16;
			n &= 0x3fffffff;
			let hash = 5381;
			hash = (hash << 5) + hash + (n & 0xff);
			hash = (hash << 5) + hash + ((n >> 8) & 0xff);
			hash = (hash << 5) + hash + ((n >> 16) & 0xff);
			hash = (hash << 5) + hash + (n >> 24);
			n = hash & 0x3fffffff;
		}
		this.seed = (n & 0x1fffffff) + 131;
	}

	/** Original mt.Rand.int() Flash9 version. */
	private nextInt(): number {
		// Maximum product (2^31 * 16807) fits exactly in JS integer precision.
		this.seed = (this.seed * 16807) % 2147483647;
		return Math.trunc(this.seed) & 0x3fffffff;
	}

	/** Original random(n); returns a zero-based frame index. */
	random(n: number): number {
		if (!Number.isSafeInteger(n) || n <= 0 || n > 0x3fffffff) {
			throw new RangeError('mt.Rand.random(n) requires positive integer n');
		}
		return this.nextInt() % n;
	}

	/** Original rand() (not used by the dungeon scene, included for verification). */
	rand(): number {
		return (this.nextInt() % 10007) / 10007;
	}
}

/**
 * Frame number (1-based) for the requested draw in View.displayLevel().
 * drawIndex 0 is the ground, 1+ are the wall symbols in original attach order.
 *
 * IMPORTANT: the exact result for index > 0 depends on all previous symbol
 * timeline frame counts. Use mtDungeonTileFrame() below with that sequence
 * instead of assuming all frame groups share the same number of frames.
 */
export function mtDungeonTileFrame(seed: number, frameCountsThroughDraw: readonly number[]): number {
	if (frameCountsThroughDraw.length === 0) throw new Error('At least one frame count is required');
	const rand = new MtRand(0);
	rand.initSeed(seed);
	let frame = 1;
	for (const frameCount of frameCountsThroughDraw) frame = rand.random(frameCount) + 1;
	return frame;
}
