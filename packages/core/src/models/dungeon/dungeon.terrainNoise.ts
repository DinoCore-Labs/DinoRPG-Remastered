/**
 * Deterministic preview of the terrain noise used by the dungeon scene.
 *
 * Transcribed from EternalTwin's MazeRenderer.zoneIds() value-noise lattice,
 * NOT Flash BitmapData.perlinNoise. Never describe it as an exact Motion Twin
 * reproduction. Stable absolute map coordinates avoid camera-scroll seams.
 *
 * The historical View.getOverMap() thresholds, bitmasks and skin settings
 * remain in dungeon.scene.ts. This function only provides the blue-channel
 * noise sample previously hardcoded to 255.
 */
import type { DungeonPerlinType } from './dungeon.skins.js';

/** Return an integer byte in 0..255, sampled at absolute map-cell coordinates. */
export function createMtDungeonTerrainNoise(
	mapId: string,
	level: number,
	perlin: DungeonPerlinType
): (x: number, y: number) => number {
	if (!mapId || !Number.isSafeInteger(level) || level < 0) throw new Error('Invalid dungeon terrain noise identity.');
	// Stable seeded hash, independent from the process or request lifecycle.
	let seed = 2166136261 >>> 0;
	for (let i = 0; i < mapId.length; i++) {
		seed ^= mapId.charCodeAt(i);
		seed = Math.imul(seed, 16777619) >>> 0;
	}
	const step = perlin === 'PDense' ? 5 : 7;
	const lattice = (ix: number, iy: number): number => {
		let v = (Math.imul(ix, 374761393) ^ Math.imul(iy, 668265263) ^ seed ^ Math.imul(level + 1, 2246822519)) >>> 0;
		v = Math.imul(v ^ (v >>> 13), 1274126177);
		return ((v ^ (v >>> 16)) >>> 0) % 256;
	};
	return (x: number, y: number): number => {
		if (!Number.isSafeInteger(x) || !Number.isSafeInteger(y))
			throw new Error('Invalid dungeon terrain noise coordinate.');
		const ix = Math.floor(x / step);
		const iy = Math.floor(y / step);
		const tx = x / step - ix;
		const ty = y / step - iy;
		const u = tx * tx * (3 - 2 * tx);
		const v = ty * ty * (3 - 2 * ty);
		const a = lattice(ix, iy);
		const n =
			a +
			(lattice(ix + 1, iy) - a) * u +
			(lattice(ix, iy + 1) - a) * v +
			(a + lattice(ix + 1, iy + 1) - lattice(ix + 1, iy) - lattice(ix, iy + 1)) * u * v;
		return Math.round(Math.max(0, Math.min(255, n)));
	};
}
