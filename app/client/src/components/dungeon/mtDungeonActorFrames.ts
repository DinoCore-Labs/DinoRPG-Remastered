/**
 * Legacy sdino uses an older PixiJS scene graph than Remastered's PixiJS 8.
 * This module asks the existing, independently working `toAnimation()` API
 * to rasterize the original frames, then loads only their image URLs into
 * PixiJS 8 textures. NO legacy Container/Sprite is shared between renderers.
 */
import { sdino } from '@eternaltwin/dinorpg_animations';
import { Assets, type Texture } from 'pixi.js';

interface LegacyDinozAnimation {
	toAnimation(callback: (element: HTMLElement) => void, width: number, height: number): void;
}

const cache = new Map<string, Promise<readonly Texture[]>>();

function renderFrameSources(code: string): Promise<string[]> {
	return new Promise((resolve, reject) => {
		try {
			const legacy = new sdino({ data: code, flip: 1, pflag: true }) as unknown as LegacyDinozAnimation;
			legacy.toAnimation(
				element => {
					try {
						const sources = [...element.querySelectorAll('img')]
							.map(image => image.currentSrc || image.src)
							.filter(
								source => source.startsWith('data:image/') || source.startsWith('blob:') || /^https?:\/\//.test(source)
							);
						if (!sources.length) throw new Error('Aucune frame image produite par sdino.toAnimation');
						resolve(sources);
					} catch (error) {
						reject(error);
					}
				},
				70,
				70
			);
		} catch (error) {
			reject(error);
		}
	});
}

export function loadMtDungeonActorFrames(code: string): Promise<readonly Texture[]> {
	if (!code) return Promise.reject(new Error('Code graphique du Dinoz manquant'));
	const existing = cache.get(code);
	if (existing) return existing;
	const pending = renderFrameSources(code).then(sources =>
		Promise.all(sources.map(source => Assets.load<Texture>(source)))
	);
	cache.set(code, pending);
	void pending.catch(() => {
		if (cache.get(code) === pending) cache.delete(code);
	});
	return pending;
}
