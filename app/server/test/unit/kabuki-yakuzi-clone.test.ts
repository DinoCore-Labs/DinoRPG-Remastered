import { ElementType } from '@dinorpg/core/models/enums/ElementType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FighterType } from '@dinorpg/core/models/fight/fighterType.js';
import { Boss, bossList } from '@dinorpg/core/models/monster/bossList.js';
import { describe, expect, it } from 'vitest';

import type { DetailedFight } from '../../src/utils/fight/generateFight.js';
import { cloneDinoz, initializeMonster } from '../../src/utils/fight/getFighters.js';

describe('MT Yakuzi clone', () => {
	it('clones Yakuzi without losing its VOID element', () => {
		const yakuzi = initializeMonster(
			{
				existingMonsters: 0,
				renfortApplied: 0,
				wormCalls: 0
			},
			null,
			1,
			bossList[Boss.YAKUZI],
			PlaceEnum.FORGES_DU_GTC,
			false,
			() => 0.5
		);

		const fight = {
			fighters: [yakuzi],
			rng: () => 0.5
		} as unknown as DetailedFight;

		const clone = cloneDinoz(yakuzi, fight, true);

		clone.level = 1;
		clone.master = yakuzi.id;

		expect(yakuzi.elements).toEqual([ElementType.VOID]);
		expect(clone.elements).toEqual([ElementType.VOID]);
		expect(clone.element).toBe(ElementType.VOID);

		expect(clone.type).toBe(FighterType.CLONE);
		expect(clone.level).toBe(1);
		expect(clone.hp).toBe(1);
		expect(clone.name).toBe(yakuzi.name);
		expect(clone.display).toBe(yakuzi.display);
		expect(clone.stats.base[ElementType.VOID]).toBe(22);
		expect(clone.skills).toEqual([]);
		expect(clone.master).toBe(yakuzi.id);
	});
});
