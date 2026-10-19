import { describe, expect, it, vi } from 'vitest';

import { loadMtDungeonGuardianFrames } from '../../../src/components/dungeon/mtDungeonGuardianFrames.js';

const mocks = vi.hoisted(() => ({
	loaded: [] as string[],
	constructors: [] as unknown[],
	stopped: 0
}));
vi.mock('@eternaltwin/dinorpg_animations', () => ({
	smonster: class {
		collider = { width: 30, height: 35 };
		scale = { set: vi.fn() };
		playing = false;
		constructor(data: unknown) {
			mocks.constructors.push(data);
		}
		toRawAnimation(cb: (frames: string[]) => void, width: number, height: number) {
			expect(width).toBe(72);
			expect(height).toBe(72);
			cb(['data:image/png;base64,AAAA', 'data:image/png;base64,BBBB']);
		}
		destroy() {
			mocks.stopped++;
		}
	}
}));
vi.mock('pixi.js', () => ({
	Assets: {
		load: (url: string) => {
			mocks.loaded.push(url);
			return Promise.resolve({ url });
		}
	}
}));

describe('MT smonster legacy frame bridge', () => {
	it('converts authentic smonster frames to PixiJS 8-compatible textures', async () => {
		const first = await loadMtDungeonGuardianFrames('worm2');
		const second = await loadMtDungeonGuardianFrames('worm2');
		expect(first).toHaveLength(2);
		expect(first).toBe(second);
		expect(mocks.loaded).toHaveLength(2);
		expect(mocks.constructors).toEqual([{ type: 'worm2', pflag: false, autoUpdate: false }]);
		expect(mocks.stopped).toBe(1);
	});
	it('rejects invalid graphical IDs before constructing a legacy animator', async () => {
		await expect(loadMtDungeonGuardianFrames('../../evil')).rejects.toThrow('invalide');
	});
});
