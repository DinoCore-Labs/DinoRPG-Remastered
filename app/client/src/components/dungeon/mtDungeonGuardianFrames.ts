/**
 * Render original smonsters.swf stand frames using the already installed
 * @eternaltwin/dinorpg_animations package (legacy PixiJS), then load only
 * their image URLs into the app's native PixiJS 8 scene.
 * No cross-version DisplayObject is ever added to Remastered's stage.
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

const FRAME_SIZE = 72;
const cache = new Map<string, Promise<readonly Texture[]>>();

function rawStandFrames(gfx: string): Promise<readonly string[]> {
	return new Promise((resolve, reject) => {
		let monster: LegacyMonster | undefined;
		try {
			// autoUpdate:false avoids the legacy Animator's Ticker.shared listener leak.
			monster = new smonster({ type: gfx, pflag: false, autoUpdate: false }) as unknown as LegacyMonster;
			const width = Math.max(1, monster.collider.width);
			const height = Math.max(1, monster.collider.height);
			// Fit the authored MT monster inside one cell, without enlarging it.
			monster.scale.set(Math.min(1, 52 / width, 52 / height));
			monster.toRawAnimation(
				frames => {
					try {
						if (!frames.length || frames.some(src => !src.startsWith('data:image/'))) {
							throw new Error(`Frames smonster invalides pour ${gfx}`);
						}
						resolve(frames);
					} catch (error) {
						reject(error);
					} finally {
						if (monster) {
							monster.playing = false;
							monster.destroy({ children: true });
						}
					}
				},
				FRAME_SIZE,
				FRAME_SIZE
			);
		} catch (error) {
			if (monster) {
				monster.playing = false;
				monster.destroy({ children: true });
			}
			reject(error);
		}
	});
}

export function loadMtDungeonGuardianFrames(gfx: string): Promise<readonly Texture[]> {
	if (!/^[a-z][a-z0-9]*$/.test(gfx)) return Promise.reject(new Error('Identifiant graphique MT invalide'));
	const prior = cache.get(gfx);
	if (prior) return prior;
	const pending = rawStandFrames(gfx).then(sources => Promise.all(sources.map(src => Assets.load<Texture>(src))));
	cache.set(gfx, pending);
	void pending.catch(() => {
		if (cache.get(gfx) === pending) cache.delete(gfx);
	});
	return pending;
}
