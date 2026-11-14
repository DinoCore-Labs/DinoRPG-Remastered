import { describe, expect, it } from 'vitest';

import { PlaceEnum } from '../../../src/models/enums/PlaceEnum.js';
import { getClinicDisplayPlaceId } from '../../../src/models/place/clinicPlace.js';
import { placeListv2 } from '../../../src/models/place/placeListv2.js';
import { CLINIC_SCENARIO_STEPS } from '../../../src/models/scenarios/data/clinicScenario.js';
import { getScenarioDefinition } from '../../../src/models/scenarios/scenarioList.js';

describe('clinic scenario and MT place aliases', () => {
	it('registers clinik with all original dialogue stages, including the future care stage', () => {
		expect(getScenarioDefinition('clinik')).toMatchObject({
			key: 'clinik',
			nameKey: 'scenarios.clinik.name',
			maxProgression: 9
		});
		expect(CLINIC_SCENARIO_STEPS.CLAN_CONSTRUCTION).toBe(6);
		expect(CLINIC_SCENARIO_STEPS.CLINIC_OPEN).toBe(8);
	});

	it('preserves the original physical location and alternate visual location', () => {
		expect(placeListv2[PlaceEnum.CLINIQUE].placeId).toBe(38);
		expect(placeListv2[PlaceEnum.CLINI2]).toMatchObject({
			placeId: 129,
			gotoPlaceId: PlaceEnum.CLINIQUE,
			realPlaceId: PlaceEnum.CLINIQUE,
			background: 'clinique2'
		});
	});

	it('switches only the visual place after the current clan finishes hopita', () => {
		expect(getClinicDisplayPlaceId(PlaceEnum.CLINIQUE, [])).toBe(PlaceEnum.CLINIQUE);
		expect(getClinicDisplayPlaceId(PlaceEnum.CLINIQUE, ['tour'])).toBe(PlaceEnum.CLINIQUE);
		expect(getClinicDisplayPlaceId(PlaceEnum.CLINIQUE, ['hopita'])).toBe(PlaceEnum.CLINI2);
		expect(getClinicDisplayPlaceId(PlaceEnum.DINOPLAZA, ['hopita'])).toBe(PlaceEnum.DINOPLAZA);
	});
});
