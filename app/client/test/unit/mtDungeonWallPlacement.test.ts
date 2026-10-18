import { describe, expect, it } from 'vitest';

import { mtWallBounds, placeMtWall } from '../../src/components/dungeon/mtDungeonWallPlacement.js';

describe('MT exported wall calibration for local diagnostics', () => {
	it('preserves unmodified MT placement by default', () => {
		expect(placeMtWall('corner-bottom-right', 3, 4)).toMatchObject({ x: 168, y: 208, flipX: true });
	});
	it('moves only PNG registration coordinates, never stretches the bitmap', () => {
		const unmodified = placeMtWall('side-right', 3, 4);
		const adjusted = placeMtWall('side-right', 3, 4, 40, { x: -2, y: 1 });
		expect(adjusted.x).toBe(unmodified.x - 2);
		expect(adjusted.y).toBe(unmodified.y + 1);
		expect(mtWallBounds(adjusted, 9, 59)).toMatchObject({ width: 9, height: 59 });
	});
	it('rejects unrealistic calibration offsets', () => {
		expect(() => placeMtWall('front', 0, 0, 40, { x: 99, y: 0 })).toThrow();
	});
});
