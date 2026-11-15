import { describe, expect, it } from 'vitest';

import { PlaceEnum } from '../../../src/models/enums/PlaceEnum.js';
import { getClinicDisplayPlaceId, getClinicDisplayPlaceKey } from '../../../src/models/place/clinicPlace.js';

describe('clinik / clinik2 : représentation par clan', () => {
	it('garde le chantier avant la construction', () => {
		const displayId = getClinicDisplayPlaceId(PlaceEnum.CLINIQUE, []);
		expect(displayId).toBe(PlaceEnum.CLINIQUE);
		expect(getClinicDisplayPlaceKey(PlaceEnum.CLINIQUE, displayId, 'clinik')).toBe('clinik');
	});

	it('retourne clinik2 après la construction sans changer le lieu réel', () => {
		const placeId = PlaceEnum.CLINIQUE;
		const displayId = getClinicDisplayPlaceId(placeId, ['hopita']);
		expect(placeId).toBe(38);
		expect(displayId).toBe(129);
		expect(getClinicDisplayPlaceKey(placeId, displayId, 'clinik')).toBe('clinik2');
	});

	it('ne modifie aucun autre nom de lieu', () => {
		expect(getClinicDisplayPlaceKey(PlaceEnum.DINOVILLE, PlaceEnum.DINOVILLE, 'dnv')).toBe('dnv');
		expect(getClinicDisplayPlaceKey(PlaceEnum.CLINIQUE, undefined, 'clinik')).toBe('clinik');
	});
});
