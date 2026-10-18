/**
 * Registration adapter for the PNG exports of Motion Twin's Flash wall symbols.
 *
 * View.hx/displayLevel attaches the 8 parts with offset SIZE+8 on east/south
 * corners, and uses depths 0 (north) and 3 (near walls). The exported PNG
 * bounding rectangles no longer carry Flash symbol registration points:
 * these anchors are a testable reconstruction, inspired by comparison of
 * the original View.hx and the Eternaltwin maze-poc's native-size renderer.
 *
 * IMPORTANT: these are renderer coordinates, not dungeon movement rules.
 * Never scale wall PNGs to fill a 40x40 tile.
 */
import type { MtWallPart } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

export interface MtWallPlacement {
	/** World-space pixel coordinate where the PNG anchor is placed. */
	x: number;
	y: number;
	anchorX: 0 | 1;
	anchorY: 0 | 1;
	flipX: boolean;
	/** Flash depth: north walls behind actors, near walls in front. */
	plane: 'behind-actors' | 'in-front-of-actors';
}

/** x/y are the source *tile* coordinates (not a PNG's top-left pixel). */
export function placeMtWall(
	part: MtWallPart,
	x: number,
	y: number,
	cell = 40,
	calibration: Readonly<{ x: number; y: number }> = { x: 0, y: 0 }
): MtWallPlacement {
	if (![calibration.x, calibration.y].every(v => Number.isInteger(v) && Math.abs(v) <= 20))
		throw new Error('MT wall calibration must use whole pixels within ±20.');
	const l = x * cell;
	const t = y * cell;
	const foot = t + cell + cell * (8 / 40);
	// Corners to the east are attached by View.hx at (SIZE+8, 0|SIZE+8).
	const east = l + cell + cell * (8 / 40);
	const dx = calibration.x;
	const dy = calibration.y;
	switch (part) {
		case 'front':
			return { x: l + dx, y: t + dy, anchorX: 0, anchorY: 1, flipX: false, plane: 'behind-actors' };
		case 'corner-top-left':
			return { x: l + dx, y: t + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'behind-actors' };
		case 'corner-top-right':
			return { x: east + dx, y: t + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'behind-actors' };
		case 'side-left':
			return { x: l + dx, y: foot + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'in-front-of-actors' };
		case 'side-right':
			return { x: l + cell + dx, y: foot + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'in-front-of-actors' };
		case 'back':
			return { x: l + dx, y: t + cell + dy, anchorX: 0, anchorY: 0, flipX: false, plane: 'in-front-of-actors' };
		case 'corner-bottom-left':
			return { x: l + dx, y: foot + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'in-front-of-actors' };
		case 'corner-bottom-right':
			return { x: east + dx, y: foot + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'in-front-of-actors' };
	}
}

/** Image-space bounds for the debugging overlay (no stretching). */
export function mtWallBounds(
	placement: MtWallPlacement,
	width: number,
	height: number
): { x: number; y: number; width: number; height: number } {
	return {
		x: placement.x - (placement.flipX ? 1 - placement.anchorX : placement.anchorX) * width,
		y: placement.y - placement.anchorY * height,
		width,
		height
	};
}
