import { selectMtGuardianSprite } from '@dinorpg/core/models/dungeon/dungeon.originalEvidence.js';
import type { MtDungeonScene } from '@dinorpg/core/models/dungeon/dungeon.scene.js';
import { describe, expect, it } from 'vitest';

import { getVisibleMtDungeonGuardianVisuals } from '../../../src/Dungeon/Service/mtDungeonGuardianVisuals.service.js';

const keys = ['worm2', 'worm', 'scorp', 'cactus', 'brig1', 'brig2', 'brig3'];
const features: MtDungeonScene['features'] = [
	{ kind: 'guardian', source: 'door', x: 5, y: 6, randomSeed: 506 },
	{ kind: 'guardian', source: 'scenario', x: 6, y: 7, gfx: 'worm' },
	{ kind: 'gold', x: 8, y: 8 }
];

describe('visible MT guardian visuals (never combat selection)', () => {
	it('selects a door visual with the original seeded MT random routine', () => {
		const actual = getVisibleMtDungeonGuardianVisuals({ features }, 100, 100, keys);
		expect(actual).toEqual([
			{
				x: 5,
				y: 6,
				source: 'door',
				gfx: selectMtGuardianSprite({ x: 5, y: 6, width: 100, height: 100, serverMonsterSprites: keys }).sprite
			},
			{ x: 6, y: 7, gfx: 'worm', source: 'scenario' }
		]);
	});
	it('supports monsters from any MT dungeon without a stepp allowlist', () => {
		const candidates = ['smonstera', 'smonsterb'];
		const nonStepp = getVisibleMtDungeonGuardianVisuals(
			{
				features: [
					{ kind: 'guardian', source: 'door', x: 1, y: 2, randomSeed: 102 },
					{ kind: 'guardian', source: 'scenario', x: 3, y: 4, gfx: 'smonstera' }
				]
			},
			20,
			20,
			candidates
		);
		expect(nonStepp).toEqual([
			{
				x: 1,
				y: 2,
				source: 'door',
				gfx: selectMtGuardianSprite({ x: 1, y: 2, width: 20, height: 20, serverMonsterSprites: candidates }).sprite
			},
			{ x: 3, y: 4, source: 'scenario', gfx: 'smonstera' }
		]);
	});
	it('does not create guardians missing from the redacted scene', () => {
		expect(getVisibleMtDungeonGuardianVisuals({ features: [] }, 100, 100, keys)).toEqual([]);
	});
	it('rejects malformed graphic identifiers before they reach the canvas', () => {
		expect(
			getVisibleMtDungeonGuardianVisuals(
				{ features: [{ kind: 'guardian', source: 'scenario', x: 2, y: 2, gfx: '../unknown' }] },
				100,
				100,
				keys
			)
		).toEqual([]);
	});
});
