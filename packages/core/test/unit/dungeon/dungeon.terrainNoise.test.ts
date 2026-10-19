import { describe, expect, it } from 'vitest';

import { createMtDungeonTerrainNoise } from '../../../src/models/dungeon/dungeon.terrainNoise.js';

const sample = (f: (x: number, y: number) => number, n = 80) =>
	Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => f(x, y)));

describe('MT dungeon terrain preview noise (EternalTwin approximation)', () => {
	it('is stable across requests and viewport changes', () => {
		const a = createMtDungeonTerrainNoise('stepp_0', 0, 'PFew');
		const b = createMtDungeonTerrainNoise('stepp_0', 0, 'PFew');
		for (const [x, y] of [
			[0, 0],
			[5, 8],
			[55, 71],
			[-2, 3]
		])
			expect(a(x, y)).toBe(b(x, y));
	});
	it('returns valid integer bytes and generates multiple visual terrain regions', () => {
		for (const perlin of ['PFew', 'PNormal', 'PDense'] as const) {
			const values = sample(createMtDungeonTerrainNoise('stepp_0', 0, perlin)).flat();
			expect(values.every(n => Number.isInteger(n) && n >= 0 && n <= 255)).toBe(true);
			const lo = perlin === 'PFew' ? 60 : 85;
			const hi = perlin === 'PFew' ? 75 : 115;
			expect(values.some(n => n < lo)).toBe(true);
			expect(values.some(n => n >= lo && n < hi)).toBe(true);
			expect(values.some(n => n >= hi)).toBe(true);
		}
	});
	it('varies by original map identity, level and density while remaining deterministic', () => {
		const first = createMtDungeonTerrainNoise('stepp_0', 0, 'PFew');
		const other = createMtDungeonTerrainNoise('stepp_1', 0, 'PFew');
		const upstairs = createMtDungeonTerrainNoise('stepp_0', 1, 'PFew');
		const dense = createMtDungeonTerrainNoise('stepp_0', 0, 'PDense');
		expect(sample(first, 12)).not.toEqual(sample(other, 12));
		expect(sample(first, 12)).not.toEqual(sample(upstairs, 12));
		expect(sample(first, 12)).not.toEqual(sample(dense, 12));
	});
	it('rejects invalid coordinates and scene identities', () => {
		expect(() => createMtDungeonTerrainNoise('', 0, 'PFew')).toThrow();
		expect(() => createMtDungeonTerrainNoise('stepp_0', -1, 'PFew')).toThrow();
		expect(() => createMtDungeonTerrainNoise('stepp_0', 0, 'PFew')(0.2, 1)).toThrow();
	});
});
