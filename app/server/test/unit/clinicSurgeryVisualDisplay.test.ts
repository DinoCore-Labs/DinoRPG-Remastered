import { chooseClinicSurgeryVisualTraits } from '@dinorpg/core/models/clinic/clinicSurgery.js';
import { raceList } from '@dinorpg/core/models/dinoz/raceList.js';
import { RaceEnum } from '@dinorpg/core/models/enums/Race.js';
import { describe, expect, it } from 'vitest';

import { generateDinozDisplay } from '../../src/utils/dinoz/displayDinoz.js';

describe('Anna Tomie: ancien préfixe visuel du Dinoz', () => {
	it('accepte un Castivore dont le préfixe visuel est 44 et non 40', () => {
		const race = raceList[RaceEnum.CASTIVORE];
		const original = '44PGFE65LC3B0000';
		expect(race.swfLetter).toBe('40');
		const traits = chooseClinicSurgeryVisualTraits(race, original, () => 0.2);
		expect(traits).toEqual({ palette: '0', rare1: '0', rare2: '0' });

		// The existing generator can be used without altering the Dinoz' encoded visual variant.
		const visualRace = { ...race, swfLetter: original.slice(0, 2) };
		const nextDisplay = generateDinozDisplay(visualRace, traits.palette, traits.rare1, traits.rare2);
		expect(nextDisplay).toMatch(/^44[0-9A-Za-z]{14}$/);
		expect(nextDisplay.slice(13)).toBe('000');
		expect(race.swfLetter).toBe('40'); // no mutation of raceList
	});

	it('refuse encore un préfixe d’une autre famille de race', () => {
		const race = raceList[RaceEnum.CASTIVORE];
		expect(() => chooseClinicSurgeryVisualTraits(race, '54PGFE65LC3B0000')).toThrow('Invalid Dinoz display');
	});

	it('refuse une chaîne malformée au lieu de corrompre le Dinoz', () => {
		const race = raceList[RaceEnum.CASTIVORE];
		expect(() => chooseClinicSurgeryVisualTraits(race, '44wrong')).toThrow('Invalid Dinoz display');
	});
});
