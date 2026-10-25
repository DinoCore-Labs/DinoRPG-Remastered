/**
 * Sprite masks extracted from Motion Twin DinoRPG gfx/dungeon/gfx.swf
 * ExportAssets 'fog', DefineSprite 404, 4 frames: each contains
 * the 40x40 black Shape399 plus one of Shapes400..403, with curved edges.
 *
 * Pixels are WHITE, not black, only so PixiJS multiplicative tint works;
 * alpha and 68x68 geometry are unchanged from the extracted PNGs.
 * 68px source viewBox = (-14,-14,68,68), at native 40px MT scale.
 *
 * MT gfx/dungeon/View.hx displayLevel(): draw each unknown tile into the
 * same BitmapData, then tint the composite to skin.fog and blur it 32px.
 * No invented radii, global darkening or server-side visibility changes.
 */
import type { MtDungeonScene, MtViewport } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

export const MT_ORIGINAL_FOG_TILE_PX = 40;
export const MT_ORIGINAL_FOG_MARGIN_PX = 14;
export const MT_ORIGINAL_FOG_BLUR_PX = 32;
export const MT_ORIGINAL_FOG_BLUR_QUALITY = 1;
// fx_reveal is a separate SWF symbol, not part of this extraction.
export const MT_ORIGINAL_FOG_REVEAL_ALPHA = 0.22;
export const MT_ORIGINAL_FOG_REVEAL_BLUR_PX = 12;

export const MT_ORIGINAL_FOG_URLS = [
	'/dungeon/mt/fog_mt_1_mask.png',
	'/dungeon/mt/fog_mt_2_mask.png',
	'/dungeon/mt/fog_mt_3_mask.png',
	'/dungeon/mt/fog_mt_4_mask.png'
] as const;

export interface MtOriginalFogSprite {
	/** Screen-space location of the 68x68 alpha mask, before camera easing. */
	x: number;
	y: number;
	frame: 0 | 1 | 2 | 3;
}

function positiveMod(value: number, mod: number): number {
	return ((value % mod) + mod) % mod;
}

/**
 * View.hx uses X-major 'pos = level * width * height + x * height + y'.
 * Its frame expression divides by a 'block' MovieClip frame count, not the
 * fog sprite frame count. As the extracted fog has 4 frames, use the four
 * available variants, keyed by the historical X-major index. This is a
 * documented selection fallback, NOT proof of the original modulo's value.
 * The selection is deterministic regardless of viewport/camera position.
 */
export function mtOriginalFogFrame(
	level: number,
	mapWidth: number,
	mapHeight: number,
	x: number,
	y: number
): 0 | 1 | 2 | 3 {
	const index = level * mapWidth * mapHeight + x * mapHeight + y;
	return positiveMod(index, MT_ORIGINAL_FOG_URLS.length) as 0 | 1 | 2 | 3;
}

export function mtOriginalFogSprite(
	tile: { x: number; y: number },
	viewport: Pick<MtViewport, 'ix' | 'iy'>,
	level: number,
	mapWidth: number,
	mapHeight: number
): MtOriginalFogSprite {
	return {
		x: (tile.x - viewport.ix) * MT_ORIGINAL_FOG_TILE_PX - MT_ORIGINAL_FOG_MARGIN_PX,
		y: (tile.y - viewport.iy) * MT_ORIGINAL_FOG_TILE_PX - MT_ORIGINAL_FOG_MARGIN_PX,
		frame: mtOriginalFogFrame(level, mapWidth, mapHeight, tile.x, tile.y)
	};
}

/** Inputs are strictly the scene's unknown tiles, already decided by the server. */
export function mtOriginalFogSprites(
	scene: Pick<MtDungeonScene, 'fog' | 'viewport' | 'roomIds' | 'level'>
): MtOriginalFogSprite[] {
	const mapWidth = scene.roomIds.length;
	const mapHeight = scene.roomIds[0]?.length ?? 0;
	return scene.fog.map(tile => mtOriginalFogSprite(tile, scene.viewport, scene.level, mapWidth, mapHeight));
}
