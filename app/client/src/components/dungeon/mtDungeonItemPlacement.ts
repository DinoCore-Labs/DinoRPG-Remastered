/**
 * Static dungeon item placement equivalent to MazeRenderer.drawIcon()/sprite().
 * This is a graphical adapter for authentic archived PNGs, not a gameplay rule.
 * Logical map coordinates stay at the top-left of a 40px cell in sprite plans.
 * No sprite is created for an unknown filename or a missing Flash export.
 */
export interface MtDungeonItemPlacement {
	x: number;
	y: number;
	anchorX: 0.5;
	anchorY: 0.5;
	scale: number;
}

/** x/y are *absolute pixel coordinates of the cell's top-left*. */
export function placeMtDungeonItem(
	file: string,
	x: number,
	y: number,
	textureWidth: number,
	textureHeight: number,
	cell = 40
): MtDungeonItemPlacement | null {
	if (
		![x, y, textureWidth, textureHeight, cell].every(Number.isFinite) ||
		textureWidth <= 0 ||
		textureHeight <= 0 ||
		cell <= 0
	)
		return null;

	let relativeSize: number;
	let offsetY = 0;

	if (file === 'item_stair_up.png') {
		relativeSize = 1.2;
		offsetY = -0.4;
	} else if (file === 'item_stair_down.png') {
		relativeSize = 0.9;
		offsetY = -0.4;
	} else if (/^item_door_[hv]_(?:01|open)\.png$/.test(file)) {
		relativeSize = 1.3;
	} else if (/^item_key_\d{2}\.png$/.test(file)) {
		relativeSize = 0.7;
	} else if (file === 'item_scroll.png') {
		relativeSize = 0.7;
	} else if (file === 'item_gold.png' || file === 'item_chest.png' || file === 'item_skel.png') {
		relativeSize = 0.8;
	} else {
		return null;
	}

	return {
		x: x + cell / 2,
		y: y + cell / 2 + offsetY * cell,
		anchorX: 0.5,
		anchorY: 0.5,
		scale: (cell * relativeSize) / Math.max(textureWidth, textureHeight)
	};
}
