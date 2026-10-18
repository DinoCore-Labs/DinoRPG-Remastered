/**
 * Motion Twin dungeon camera interpolation, client-side only.
 *
 * Source: Motion Twin, DinoRPG/gfx/dungeon/View.hx, updateScroll():
 * view.dx += (target - (view.ix + view.dx)) * 0.1 per Flash frame.
 *
 * Eternaltwin's maze-poc provided a useful Pixi camera reference, but uses
 * a dead-zone camera. Remastered intentionally keeps MT's 9x9 camera and
 * interpolates between SERVER-AUTHORIZED 9x9 viewports instead.
 *
 * The camera never decides which cells are accessible or visible.
 */

export interface MtCameraViewport {
	ix: number;
	iy: number;
	level: number;
	mapId: string;
}

export interface MtCameraShift {
	/** Offset applied to the newly painted map so it initially stays in place. */
	offsetX: number;
	offsetY: number;
	/** Same movement in tile pixels, to adjust actors' old local coordinates. */
	deltaX: number;
	deltaY: number;
	/** Snap without scrolling across stages, levels or non-adjacent views. */
	snap: boolean;
}

export const MT_CAMERA_TILE_PIXELS = 40;
const FLASH_FRAME_MS = 1000 / 60;
const FLASH_REMAINING_FRACTION = 0.9;

/** One cell at a time. No camera animation across map or level transitions. */
export function mtCameraShift(
	previous: MtCameraViewport | null,
	next: MtCameraViewport,
	currentOffset: { x: number; y: number },
	tileSize = MT_CAMERA_TILE_PIXELS
): MtCameraShift {
	if (!previous || previous.mapId !== next.mapId || previous.level !== next.level) {
		return { offsetX: 0, offsetY: 0, deltaX: 0, deltaY: 0, snap: true };
	}
	const dx = next.ix - previous.ix;
	const dy = next.iy - previous.iy;
	if (!Number.isInteger(dx) || !Number.isInteger(dy) || Math.abs(dx) > 1 || Math.abs(dy) > 1) {
		return { offsetX: 0, offsetY: 0, deltaX: 0, deltaY: 0, snap: true };
	}
	const deltaX = dx * tileSize;
	const deltaY = dy * tileSize;
	return {
		offsetX: currentOffset.x + deltaX,
		offsetY: currentOffset.y + deltaY,
		deltaX,
		deltaY,
		snap: false
	};
}

/** Frame-rate independent form of MT's 10% per 60 Hz Flash frame. */
export function easeMtCameraOffset(offset: number, deltaMS: number): number {
	if (!Number.isFinite(offset)) return 0;
	if (!Number.isFinite(deltaMS) || deltaMS <= 0) return offset;
	const clampedDelta = Math.min(deltaMS, 1000); // prevents numerical underflow on background-tab resume
	const next = offset * Math.pow(FLASH_REMAINING_FRACTION, clampedDelta / FLASH_FRAME_MS);
	return Math.abs(next) < 0.08 ? 0 : next;
}
