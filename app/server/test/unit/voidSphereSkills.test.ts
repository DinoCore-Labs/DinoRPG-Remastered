import { getSpecialStat, SpecialStat } from '@dinorpg/core/models/skills/getSpecialStats.js';
import { Skill, skillList } from '@dinorpg/core/models/skills/skillList.js';
import { describe, expect, it, vi } from 'vitest';

import * as updateDinozModule from '../../src/Dinoz/Controller/updateDinoz.controller.js';
import { applySkillEffect } from '../../src/Level/Controller/applySkillEffect.controller.js';
import { calculateRegeneration } from '../../src/utils/dinoz/restDinoz.js';

describe('Void Sphere Skills Rework', () => {
	describe('Gros Dormeur (Rest Regeneration)', () => {
		it('adds 1 HP per hour during rest', () => {
			const baseline = calculateRegeneration({
				hasCocon: false,
				hasRegen: false,
				hasPhoenixHeart: false,
				isPriest: false,
				hasDivineWater: false,
				hasGrosDormeur: false
			});
			expect(baseline.n).toBe(1);

			const withGrosDormeur = calculateRegeneration({
				hasCocon: false,
				hasRegen: false,
				hasPhoenixHeart: false,
				isPriest: false,
				hasDivineWater: false,
				hasGrosDormeur: true
			});
			expect(withGrosDormeur.n).toBe(2);

			const withBothCoconAndGrosDormeur = calculateRegeneration({
				hasCocon: true,
				hasRegen: false,
				hasPhoenixHeart: false,
				isPriest: false,
				hasDivineWater: false,
				hasGrosDormeur: true
			});
			expect(withBothCoconAndGrosDormeur.n).toBe(4); // 1 + 2 (cocon) + 1 (gros dormeur)
		});

		it('includes +1 HP regen in getSpecialStat for Gros Dormeur', () => {
			const stat = getSpecialStat(
				{ items: [], nbrUpFire: 0, nbrUpWood: 0, nbrUpLightning: 0, nbrUpAir: 0, nbrUpWater: 0 },
				[],
				[skillList[Skill.GROS_DORMEUR]],
				SpecialStat.HP_REGEN
			);
			expect(stat).toBeDefined();
			expect(stat?.value).toBe(2); // 1 base + 1 gros dormeur
			expect(stat?.details?.some(d => d.name === 'GrosDormeur' && d.value === 1)).toBe(true);
		});
	});

	describe('Transe Nocturne (Random Element Points)', () => {
		it('awards between 1 and 4 element points based on race affinity upon learning', async () => {
			const updateDinozSpy = vi.spyOn(updateDinozModule, 'updateDinoz').mockResolvedValue({} as any);

			const mockDinoz = {
				id: 99999,
				maxLife: 100,
				nbrUpFire: 1,
				nbrUpWood: 2,
				nbrUpWater: 0,
				nbrUpLightning: 0,
				nbrUpAir: 0,
				raceId: 1 // Moueffe (mostly fire)
			};

			const skill = skillList[Skill.TRANSE_NOCTURNE];
			expect(skill).toBeDefined();
			expect(skill.name).toBe('TranseNocturne');

			await applySkillEffect(mockDinoz, skill, 'user-123');

			expect(updateDinozSpy).toHaveBeenCalled();
			const totalAdded =
				mockDinoz.nbrUpFire +
				mockDinoz.nbrUpWood +
				mockDinoz.nbrUpWater +
				mockDinoz.nbrUpLightning +
				mockDinoz.nbrUpAir -
				3; // initial 1 fire + 2 wood = 3

			expect(totalAdded).toBeGreaterThanOrEqual(1);
			expect(totalAdded).toBeLessThanOrEqual(4);

			updateDinozSpy.mockRestore();
		});
	});
});
