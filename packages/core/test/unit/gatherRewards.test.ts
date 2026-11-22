import { describe, expect, it } from 'vitest';

import { GatherType } from '../../src/models/enums/GatherType.js';
import {
	GRID_FINISHED_GOLD_REWARD,
	HARVEST_GATHER_TYPES,
	isHarvestGatherType
} from '../../src/models/gather/gatherRewards.js';

describe('gatherRewards', () => {
	it('defines 1000 gold as completion reward', () => {
		expect(GRID_FINISHED_GOLD_REWARD).toBe(1000);
	});

	it('identifies standard harvest grid types (peche, cueillette, energie, chasse, fouille)', () => {
		const harvestTypes = [
			GatherType.FISH,
			GatherType.CUEILLE1,
			GatherType.CUEILLE2,
			GatherType.CUEILLE3,
			GatherType.CUEILLE4,
			GatherType.ENERGY1,
			GatherType.ENERGY2,
			GatherType.HUNT,
			GatherType.SEEK
		];

		for (const type of harvestTypes) {
			expect(isHarvestGatherType(type)).toBe(true);
			expect(HARVEST_GATHER_TYPES).toContain(type);
		}
	});

	it('returns false for special and ticket grids (daily, xmas, tictac, labo, anniv, party)', () => {
		const nonHarvestTypes = [
			GatherType.DAILY,
			GatherType.XMAS,
			GatherType.TICTAC,
			GatherType.LABO,
			GatherType.ANNIV,
			GatherType.PARTY
		];

		for (const type of nonHarvestTypes) {
			expect(isHarvestGatherType(type)).toBe(false);
			expect(HARVEST_GATHER_TYPES).not.toContain(type);
		}
	});
});
