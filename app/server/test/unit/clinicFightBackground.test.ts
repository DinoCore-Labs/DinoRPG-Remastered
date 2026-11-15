import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { placeListv2 } from '@dinorpg/core/models/place/placeListv2.js';
import { describe, expect, it } from 'vitest';

import { resolveClinicFightBackground } from '../../src/Fight/Service/clinicFightBackground.service.js';

describe('Clinic: fond du combat selon le chantier du clan', () => {
	it('utilise le fond du chantier tant que hopita est incomplet', () => {
		expect(resolveClinicFightBackground(PlaceEnum.CLINIQUE, [])).toBeUndefined();
		expect(placeListv2[PlaceEnum.CLINIQUE].background).toBeTruthy();
	});

	it('sélectionne le fond de la clinique construite sans déplacer le combat', () => {
		const background = resolveClinicFightBackground(PlaceEnum.CLINIQUE, ['hopita']);
		expect(background).toBe(placeListv2[PlaceEnum.CLINI2].background);
		expect(background).toBeTruthy();
		expect(background).not.toBe(placeListv2[PlaceEnum.CLINIQUE].background);
	});

	it('ne modifie pas les fonds des autres lieux', () => {
		expect(resolveClinicFightBackground(PlaceEnum.DINOPLAZA, ['hopita'])).toBeUndefined();
	});

	it('préserve un décor explicitement imposé par un scénario', () => {
		expect(resolveClinicFightBackground(PlaceEnum.CLINIQUE, ['hopita'], 'custom_bg')).toBe('custom_bg');
	});
});
