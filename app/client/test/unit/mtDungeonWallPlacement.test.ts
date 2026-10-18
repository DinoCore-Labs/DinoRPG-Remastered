import { describe, expect, it } from 'vitest';

import { mtWallBounds, placeMtWall } from '../../src/components/dungeon/mtDungeonWallPlacement.js';

const xy = (part: Parameters<typeof placeMtWall>[0]) => placeMtWall(part, 3, 4);

describe('MT dungeon exported PNG wall registration', () => {
	it('keeps original 40px cells and 8px south/east corner overhang', () => {
		expect(xy('front')).toMatchObject({ x: 120, y: 160, plane: 'behind-actors' });
		expect(xy('corner-top-right')).toMatchObject({ x: 168, y: 160, flipX: true });
		expect(xy('corner-bottom-left')).toMatchObject({ x: 120, y: 208 });
		expect(xy('corner-bottom-right')).toMatchObject({ x: 168, y: 208, flipX: true });
	});
	it('puts all near faces on depth 3, and north faces on depth 0', () => {
		for (const part of ['front', 'corner-top-left', 'corner-top-right'] as const)
			expect(xy(part).plane).toBe('behind-actors');
		for (const part of ['back', 'side-left', 'side-right', 'corner-bottom-left', 'corner-bottom-right'] as const)
			expect(xy(part).plane).toBe('in-front-of-actors');
	});
	it('mirrors the east faces without distorting source dimensions', () => {
		expect(xy('side-left')).toMatchObject({ x: 120, y: 208, anchorX: 1, anchorY: 1, flipX: false });
		expect(xy('side-right')).toMatchObject({ x: 160, y: 208, anchorX: 1, anchorY: 1, flipX: true });
		const right = mtWallBounds(xy('side-right'), 9, 59);
		expect(right).toEqual({ x: 160, y: 149, width: 9, height: 59 });
	});
	it('preserves native aspect ratios (no sprite stretching)', () => {
		const bounds = mtWallBounds(xy('corner-top-left'), 34, 31);
		expect(bounds).toEqual({ x: 86, y: 129, width: 34, height: 31 });
	});
});
