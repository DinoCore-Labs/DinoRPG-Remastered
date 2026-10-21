import { describe, expect, it } from 'vitest';

import { buildMtDungeonScene, getMtFlagIndex } from '../../../src/models/dungeon/dungeon.scene.js';
import { getDungeonSkin } from '../../../src/models/dungeon/dungeon.skins.js';
import type { DungeonStructure } from '../../../src/models/dungeon/dungeon.types.js';

// No invented corpse: both MT door guardians and real IScenario markers
// must disappear after their server-owned flag is set, while unrelated
// original skeleton (skel) story icons remain visible until read.
function map(): DungeonStructure {
	return {
		width: 5,
		height: 5,
		start: { x: 1, y: 1, l: 0 },
		exit: { x: 4, y: 4, l: 0 },
		levels: [
			{
				table: Array.from({ length: 5 }, () => Array<boolean>(5).fill(true)),
				rooms: [
					{ id: 0, x: 0, y: 0, w: 5, h: 5, doors: [{ x: 2, y: 1, up: null, key: null }], item: null },
					{ id: 1, x: 3, y: 1, w: 1, h: 1, doors: [], item: { kind: 'IScenario', x: 3, y: 1, value: 0 } }
				]
			}
		]
	};
}
const scene = (flags: number[]) => {
	const structure = map();
	return buildMtDungeonScene({
		map: structure,
		level: 0,
		viewX: 0,
		viewY: 0,
		skin: getDungeonSkin('cavern3')!,
		noiseAt: () => 255,
		flags: new Set(flags),
		scenarioIcons: [{ kind: 'DIIcon', icon: 'skel' }]
	});
};

describe('MT defeated guardian rendering', () => {
	it('does not leave a skeleton / object on a defeated door guardian tile', () => {
		const before = scene([]);
		expect(before.features).toContainEqual({ kind: 'guardian', source: 'door', x: 2, y: 1, randomSeed: 11 });
		const after = scene([getMtFlagIndex(map(), 0, 2, 1)]);
		expect(after.features.filter(f => f.x === 2 && f.y === 1)).toEqual([]);
	});
	it('keeps a genuine unresolved MT skeleton scenario until its own flag is set', () => {
		const defeatedGuardianFlag = getMtFlagIndex(map(), 0, 2, 1);
		expect(scene([defeatedGuardianFlag]).features).toContainEqual({ kind: 'scenario-icon', icon: 'skel', x: 3, y: 1 });
		const readSkeleton = getMtFlagIndex(map(), 0, 3, 1);
		expect(scene([defeatedGuardianFlag, readSkeleton]).features.some(f => f.x === 3 && f.y === 1)).toBe(false);
	});
});
