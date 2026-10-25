/**
 * MT View.hx terrain bitmap post-processing. No effect is applied to actors,
 * front/side wall sprites, item sprites, the fog (404) or the mask (49).
 *
 * The numeric parameters are transcribed from djview.swf / View.displayLevel()
 * (AVM1), but Canvas2D blur/compositing is an approximation to Flash filters.
 */

/** Original constructor parameters; kept separate from the emulation algorithm. */
export const MT_TERRAIN_FILTERS = {
	overgroundGlow: { color: 0x000000, alpha: 0.7, blurX: 2, blurY: 2, strength: 2, quality: 1 },
	innerDropShadow: {
		color: 0x000000,
		alpha: 0.3,
		distance: 15,
		angle: 0,
		blurX: 3,
		blurY: 3,
		strength: 1,
		quality: 2,
		inner: true
	},
	innerBlackGlow: { color: 0x000000, alpha: 0.35, blurX: 64, blurY: 64, strength: 2, quality: 1, inner: true },
	outerPurpleGlow: { color: 0x72525b, alpha: 0.6, blurX: 64, blurY: 64, strength: 2, quality: 1, inner: false }
} as const;

// 64px blur has a long tail. Provide overscan around the native Flash 12x12 bitmap.
export const MT_TERRAIN_EFFECT_PADDING = 128;
export const MT_TERRAIN_TILE_SIZE = 40;

export interface MtTerrainDraw {
	label: string;
	x: number;
	y: number;
	/** Source PNG bitmap in the loaded Pixi texture, if available. */
	image: CanvasImageSource;
}

export interface MtTerrainComposed {
	canvas: HTMLCanvasElement;
	/** Renderer-local coordinates, already accounting for viewport and filter padding. */
	x: number;
	y: number;
}

export function isMtTerrainDraw(label: string): boolean {
	return label.startsWith('ground:') || label.startsWith('overground:');
}

/** Purely informational; this ordering is a regression invariant from View.hx. */
export const MT_TERRAIN_FILTER_ORDER = [
	'overground-black-glow',
	'ground-inner-drop-shadow',
	'ground-inner-black-glow',
	'ground-outer-purple-glow'
] as const;

function canvas(width: number, height: number): HTMLCanvasElement {
	const c = document.createElement('canvas');
	c.width = width;
	c.height = height;
	return c;
}
function context(c: HTMLCanvasElement): CanvasRenderingContext2D {
	const ctx = c.getContext('2d');
	if (!ctx) throw new Error('Canvas 2D indisponible pour les filtres de terrain MT.');
	return ctx;
}
function hex(color: number): string {
	return `#${color.toString(16).padStart(6, '0')}`;
}

/** Re-color alpha only; the RGB of the source tile is never used by the glow. */
function tintAlpha(source: HTMLCanvasElement, color: number, alpha: number): HTMLCanvasElement {
	const output = canvas(source.width, source.height);
	const ctx = context(output);
	ctx.drawImage(source, 0, 0);
	ctx.globalCompositeOperation = 'source-in';
	ctx.globalAlpha = alpha;
	ctx.fillStyle = hex(color);
	ctx.fillRect(0, 0, output.width, output.height);
	ctx.globalAlpha = 1;
	ctx.globalCompositeOperation = 'source-over';
	return output;
}

function blurAlpha(source: HTMLCanvasElement, radius: number, x = 0, y = 0): HTMLCanvasElement {
	const output = canvas(source.width, source.height);
	const ctx = context(output);
	ctx.filter = `blur(${radius}px)`;
	ctx.drawImage(source, x, y);
	ctx.filter = 'none';
	return output;
}

/** Black inside silhouette at the exposed border, preserving interior brightness. */
function innerGlow(source: HTMLCanvasElement, alpha: number, blur: number, x = 0, y = 0): HTMLCanvasElement {
	const dark = tintAlpha(source, MT_TERRAIN_FILTERS.innerBlackGlow.color, alpha);
	const fadedSilhouette = blurAlpha(source, blur, x, y);
	const ctx = context(dark);
	ctx.globalCompositeOperation = 'destination-out';
	ctx.drawImage(fadedSilhouette, 0, 0);
	ctx.globalCompositeOperation = 'source-over';
	return dark;
}

/**
 * Compose the original floor bitmap and overground bitmap first. Then apply
 * Flash's filter family to the combined terrain alpha (Canvas approximation).
 * Return null if any required image cannot be drawn; caller should fall back
 * to its pre-existing Pixi sprite path and never leave an empty dungeon.
 */
export function composeMtTerrainBitmap(
	draws: readonly MtTerrainDraw[],
	viewport: { minX: number; minY: number; overscanPixels: number; ix: number; iy: number }
): MtTerrainComposed | null {
	if (!draws.length || typeof document === 'undefined') return null;
	const padding = MT_TERRAIN_EFFECT_PADDING;
	const width = viewport.overscanPixels + padding * 2;
	const height = viewport.overscanPixels + padding * 2;
	if (!Number.isFinite(width) || width <= 0 || width > 2048) return null;
	const floor = canvas(width, height);
	const over = canvas(width, height);
	const groundCtx = context(floor);
	const overCtx = context(over);
	const x0 = viewport.minX * MT_TERRAIN_TILE_SIZE - padding;
	const y0 = viewport.minY * MT_TERRAIN_TILE_SIZE - padding;
	try {
		for (const draw of draws) {
			const dest = isMtTerrainDraw(draw.label) && draw.label.startsWith('overground:') ? overCtx : groundCtx;
			dest.drawImage(draw.image, draw.x - x0, draw.y - y0);
		}
	} catch {
		return null;
	}

	// View.hx: apply GlowFilter(black, 0.7, 2,2,2,1) to overground, then
	// merge the filtered overground into the ground bitmap.
	const overGlow = blurAlpha(
		tintAlpha(over, MT_TERRAIN_FILTERS.overgroundGlow.color, MT_TERRAIN_FILTERS.overgroundGlow.alpha),
		MT_TERRAIN_FILTERS.overgroundGlow.blurX
	);
	groundCtx.drawImage(overGlow, 0, 0);
	groundCtx.drawImage(over, 0, 0);

	// Flash applies the following to groundBitmap in sequence: INNER shadow,
	// INNER black glow, OUTER muted purple glow. We approximate the alpha
	// compositing, keeping the unfiltered source color intact and fully opaque.
	const shadow = innerGlow(
		floor,
		MT_TERRAIN_FILTERS.innerDropShadow.alpha,
		MT_TERRAIN_FILTERS.innerDropShadow.blurX,
		MT_TERRAIN_FILTERS.innerDropShadow.distance,
		0
	);
	const blackInner = innerGlow(floor, MT_TERRAIN_FILTERS.innerBlackGlow.alpha, MT_TERRAIN_FILTERS.innerBlackGlow.blurX);
	const purple = blurAlpha(
		tintAlpha(floor, MT_TERRAIN_FILTERS.outerPurpleGlow.color, MT_TERRAIN_FILTERS.outerPurpleGlow.alpha),
		MT_TERRAIN_FILTERS.outerPurpleGlow.blurX
	);

	const final = canvas(width, height);
	const ctx = context(final);
	ctx.drawImage(purple, 0, 0);
	ctx.drawImage(floor, 0, 0);
	ctx.drawImage(shadow, 0, 0);
	ctx.drawImage(blackInner, 0, 0);
	return {
		canvas: final,
		x: x0 - viewport.ix * MT_TERRAIN_TILE_SIZE,
		y: y0 - viewport.iy * MT_TERRAIN_TILE_SIZE
	};
}
