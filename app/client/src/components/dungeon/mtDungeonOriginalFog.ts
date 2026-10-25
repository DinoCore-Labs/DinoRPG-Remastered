/**
 * Fog symbol 404 extracted from Motion Twin gfx/dungeon/gfx.swf.
 * Source validation: djview.swf AVM1 View.displayLevel() and View.updateFog().
 * 4 frames, 40px tile spacing, 68px raster masks with (-14,-14) registration.
 * Historical linear index uses x * MAP HEIGHT (not width).
 *
 * Crucial: roomIds is intentionally REDACTED from authenticated API responses.
 * Dimensions are harmless public metadata carried explicitly by MtDungeonScene.
 * Never infer map height from roomIds or viewport dimensions.
 */
import type { MtDungeonScene, MtViewport } from '@dinorpg/core/models/dungeon/dungeon.scene.js';

export const MT_ORIGINAL_FOG_TILE_PX = 40;
export const MT_ORIGINAL_FOG_MARGIN_PX = 14;
export const MT_ORIGINAL_FOG_BLUR_PX = 32;
export const MT_ORIGINAL_FOG_BLUR_QUALITY = 1;
// fx_reveal is a separate SWF symbol. No client-side discovery is performed here.
export const MT_ORIGINAL_FOG_REVEAL_ALPHA = 0.22;
export const MT_ORIGINAL_FOG_REVEAL_BLUR_PX = 12;

export const MT_ORIGINAL_FOG_URLS = [
	'/dungeon/mt/fog_mt_1_mask.png',
	'/dungeon/mt/fog_mt_2_mask.png',
	'/dungeon/mt/fog_mt_3_mask.png',
	'/dungeon/mt/fog_mt_4_mask.png'
] as const;

export interface MtOriginalFogSprite {
	x: number;
	y: number;
	/** Zero-based index into MT_ORIGINAL_FOG_URLS; Flash frame = frame + 1. */
	frame: 0 | 1 | 2 | 3;
}

function positiveMod(value: number, divisor: number): number {
	return ((value % divisor) + divisor) % divisor;
}

/** View.hx: pos = posL * width * height + px * height + py. */
export function mtOriginalFogIndex(level: number, width: number, height: number, x: number, y: number): number {
	if (![level, width, height, x, y].every(Number.isInteger) || width <= 0 || height <= 0 || level < 0)
		throw new Error('Invalid Motion Twin fog dimensions / position.');
	return level * width * height + x * height + y;
}

/** View.displayLevel: fog.gotoAndStop(1 + (pos % fog._totalframes)). */
export function mtOriginalFogFrame(
	level: number,
	mapWidth: number,
	mapHeight: number,
	x: number,
	y: number
): 0 | 1 | 2 | 3 {
	const index = mtOriginalFogIndex(level, mapWidth, mapHeight, x, y);
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

/** Fog tiles come exclusively from the server-authorized scene. No revealing here. */
export function mtOriginalFogSprites(
	scene: Pick<MtDungeonScene, 'fog' | 'viewport' | 'level' | 'mapWidth' | 'mapHeight'>
): MtOriginalFogSprite[] {
	return scene.fog.map(tile => mtOriginalFogSprite(tile, scene.viewport, scene.level, scene.mapWidth, scene.mapHeight));
}
