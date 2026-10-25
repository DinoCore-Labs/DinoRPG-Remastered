/**
 * Original MT smonster stand frames rasterized by the legacy animation package,
 * then cropped consistently before being loaded into PixiJS 8.
 *
 * Every frame of a monster shares ONE alpha bounding box: animation registration
 * remains stable and the transparent 160x160 export margin no longer determines
 * the on-screen scale.
 */
import { smonster } from '@eternaltwin/dinorpg_animations';
import { Assets, type Texture } from 'pixi.js';

interface LegacyMonster {
	collider: { width: number; height: number };
	scale: { set(value: number): void };
	playing: boolean;
	toRawAnimation(callback: (frames: string[]) => void, width: number, height: number): void;
	destroy(options?: { children: boolean }): void;
}

const FRAME_SIZE = 160;
const PADDING = 2;
const ALPHA_THRESHOLD = 8;
const cache = new Map<string, Promise<readonly Texture[]>>();

function rawStandFrames(gfx: string): Promise<readonly string[]> {
	return new Promise((resolve, reject) => {
		let monster: LegacyMonster | undefined;
		try {
			monster = new smonster({ type: gfx, pflag: false, autoUpdate: false }) as unknown as LegacyMonster;
			const width = Math.max(1, monster.collider.width);
			const height = Math.max(1, monster.collider.height);
			monster.scale.set(Math.min(1, 52 / width, 52 / height));
			monster.toRawAnimation(
				frames => {
					try {
						if (!frames.length || frames.some(src => !src.startsWith('data:image/')))
							throw new Error(`Frames smonster invalides pour ${gfx}`);
						resolve(frames);
					} catch (error) {
						reject(error);
					} finally {
						monster?.destroy({ children: true });
					}
				},
				FRAME_SIZE,
				FRAME_SIZE
			);
		} catch (error) {
			monster?.destroy({ children: true });
			reject(error);
		}
	});
}

function decodeFrame(src: string): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => reject(new Error('Décodage de frame MT impossible'));
		image.src = src;
	});
}

/** Crop using the union of every animated frame, never one rectangle per frame. */
async function cropStandFrames(sources: readonly string[]): Promise<readonly string[]> {
	// Unit tests and environments without a canvas retain the original frames.
	if (typeof document === 'undefined' || typeof Image === 'undefined') return sources;
	const images = await Promise.all(sources.map(decodeFrame));
	const width = images[0]!.naturalWidth;
	const height = images[0]!.naturalHeight;
	if (!width || !height || images.some(img => img.naturalWidth !== width || img.naturalHeight !== height))
		return sources;

	const sourceCanvas = document.createElement('canvas');
	sourceCanvas.width = width;
	sourceCanvas.height = height;
	const sourceCtx = sourceCanvas.getContext('2d', { willReadFrequently: true });
	if (!sourceCtx) return sources;

	let left = width;
	let top = height;
	let right = -1;
	let bottom = -1;
	for (const img of images) {
		sourceCtx.clearRect(0, 0, width, height);
		sourceCtx.drawImage(img, 0, 0);
		const pixels = sourceCtx.getImageData(0, 0, width, height).data;
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (pixels[(y * width + x) * 4 + 3]! <= ALPHA_THRESHOLD) continue;
				left = Math.min(left, x);
				top = Math.min(top, y);
				right = Math.max(right, x);
				bottom = Math.max(bottom, y);
			}
		}
	}
	if (right < left || bottom < top) return sources;
	left = Math.max(0, left - PADDING);
	top = Math.max(0, top - PADDING);
	right = Math.min(width - 1, right + PADDING);
	bottom = Math.min(height - 1, bottom + PADDING);
	const cropWidth = right - left + 1;
	const cropHeight = bottom - top + 1;
	if (cropWidth === width && cropHeight === height) return sources;

	const output = document.createElement('canvas');
	output.width = cropWidth;
	output.height = cropHeight;
	const outputCtx = output.getContext('2d');
	if (!outputCtx) return sources;

	return images.map(img => {
		outputCtx.clearRect(0, 0, cropWidth, cropHeight);
		outputCtx.drawImage(img, -left, -top);
		return output.toDataURL('image/png');
	});
}

export function loadMtDungeonGuardianFrames(gfx: string): Promise<readonly Texture[]> {
	if (!/^[a-z][a-z0-9]*$/.test(gfx)) return Promise.reject(new Error('Identifiant graphique MT invalide'));
	const prior = cache.get(gfx);
	if (prior) return prior;
	const pending = rawStandFrames(gfx)
		.then(sources => cropStandFrames(sources))
		.then(sources => Promise.all(sources.map(src => Assets.load<Texture>(src))));
	cache.set(gfx, pending);
	void pending.catch(() => {
		if (cache.get(gfx) === pending) cache.delete(gfx);
	});
	return pending;
}
