/**
 * Original Motion Twin 'mask' vignette, SWF gfx/dungeon/gfx.swf, ExportAssets mask ID 49.
 *
 * The supplied alpha PNG reconstructs its two children:
 * - Shape 46: original 360px radial opacity gradient (stops 65->134 of 255);
 * - Shape 47 inside Sprite 48: original irregular contour, 0.8296 scale,
 *   (29.75,29.9) translation and 0.6484 alpha, preblurred from the SWF
 *   BlurFilter(32,32,8). PNG blur is a raster approximation of Flash's filter.
 *
 * Flash View.hx overlays the stage-fixed 'mask' sprite at depth 2, applies
 * Col.setPercentColor(mask, 70, skin.fog), and sets mask._alpha = skin.mask.
 * No dungeon reveal, camera coordinate, or server state is changed here.
 */
export const MT_DUNGEON_MASK_URL = '/dungeon/mt/mask_mt_49.png';

export function mtDungeonMaskAlpha(mask: number): number {
	if (!Number.isFinite(mask)) return 0;
	return Math.max(0, Math.min(100, mask)) / 100;
}

/** Source shapes were black; Flash's 70% percent-color maps them to 70% of skin.fog. */
export function mtDungeonMaskTint(fogColor: number): number {
	const color = fogColor & 0xffffff;
	const r = Math.round(((color >> 16) & 0xff) * 0.7);
	const g = Math.round(((color >> 8) & 0xff) * 0.7);
	const b = Math.round((color & 0xff) * 0.7);
	return (r << 16) | (g << 8) | b;
}
