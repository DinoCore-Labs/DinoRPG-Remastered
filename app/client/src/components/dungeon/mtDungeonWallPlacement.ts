/**
 * Pixel-perfect layout matching EternalTwin ed-ui/src/utils/dungeon/MazeRenderer.ts,
 * drawLevel() and edge(), with 40px cells and native-sized wall PNGs.
 * Cosmetic calibration is additive, and defaults to zero.
 */
import type { MtWallPart } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

export interface MtWallPlacement {
	x: number;
	y: number;
	anchorX: 0 | 1;
	anchorY: 0 | 1;
	flipX: boolean;
	plane: 'behind-actors' | 'in-front-of-actors';
}

export function placeMtWall(
	part: MtWallPart,
	x: number,
	y: number,
	cell = 40,
	calibration: Readonly<{ x: number; y: number }> = { x: 0, y: 0 }
): MtWallPlacement {
	if (![calibration.x, calibration.y].every(v => Number.isInteger(v) && Math.abs(v) <= 20))
		throw new Error('MT wall calibration must use whole pixels within ±20.');
	const L = x * cell;
	const T = y * cell;
	const R = L + cell;
	const B = T + cell;
	const F = B + cell * (8 / 40);
	const dx = calibration.x;
	const dy = calibration.y;
	switch (part) {
		case 'front':
			return { x: L + dx, y: T + dy, anchorX: 0, anchorY: 1, flipX: false, plane: 'behind-actors' };
		case 'side-left':
			return { x: L + dx, y: F - 9 + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'in-front-of-actors' };
		case 'side-right':
			return { x: R + dx, y: F - 9 + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'in-front-of-actors' };
		case 'back':
			return { x: L + dx, y: B - 21 + dy, anchorX: 0, anchorY: 0, flipX: false, plane: 'in-front-of-actors' };
		case 'corner-top-left':
			return { x: L + dx, y: T + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'behind-actors' };
		case 'corner-top-right':
			return { x: R + dx, y: T + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'behind-actors' };
		case 'corner-bottom-left':
			return { x: L + dx, y: F + dy, anchorX: 1, anchorY: 1, flipX: false, plane: 'in-front-of-actors' };
		case 'corner-bottom-right':
			return { x: R + dx, y: F + dy, anchorX: 1, anchorY: 1, flipX: true, plane: 'in-front-of-actors' };
	}
}

/** Image-space rectangle for diagnostic overlays. */
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
