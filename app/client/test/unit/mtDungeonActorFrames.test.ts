import { describe, expect, it, vi } from 'vitest';

import { loadMtDungeonActorFrames } from '../../src/components/dungeon/mtDungeonActorFrames.js';

vi.mock('@eternaltwin/dinorpg_animations', () => ({
	sdino: class {
		toAnimation(callback: (element: { querySelectorAll: () => { currentSrc: string; src: string }[] }) => void): void {
			callback({
				querySelectorAll: () => [
					{ currentSrc: '', src: 'data:image/png;base64,QQ==' },
					{ currentSrc: 'data:image/png;base64,Qg==', src: 'data:image/png;base64,Qg==' }
				]
			});
		}
	}
}));
vi.mock('pixi.js', () => ({
	Assets: { load: vi.fn(async (source: string) => ({ source })) }
}));

describe('MT dungeon actor texture isolation', () => {
	it('loads independently rasterized animation frames as native PixiJS textures', async () => {
		const frames = await loadMtDungeonActorFrames('test-dinoz-code');
		expect(frames).toEqual([{ source: 'data:image/png;base64,QQ==' }, { source: 'data:image/png;base64,Qg==' }]);
	});
	it('caches the output without reinitializing the legacy animation', async () => {
		const first = loadMtDungeonActorFrames('test-dinoz-code');
		expect(loadMtDungeonActorFrames('test-dinoz-code')).toBe(first);
	});
	it('fails closed for missing actor graphics', async () => {
		await expect(loadMtDungeonActorFrames('')).rejects.toThrow('manquant');
	});
});
