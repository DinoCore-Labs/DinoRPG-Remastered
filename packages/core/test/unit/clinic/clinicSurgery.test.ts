import { describe, expect, it } from 'vitest';

import {
	canStartClinicSurgeryAgain,
	chooseClinicSurgeryVisualTraits,
	CLINIC_SURGERY_COOLDOWN_MS,
	CLINIC_SURGERY_DURATION_MS,
	clinicSurgeryIsReady,
	clinicSurgeryReadyAt
} from '../../../src/models/clinic/clinicSurgery.js';
import { raceList } from '../../../src/models/dinoz/raceList.js';
import { RaceEnum } from '../../../src/models/enums/Race.js';

describe('Anna Tomie — chirurgie esthétique', () => {
	it('imposes a full hour and a rolling thirty-day cooldown', () => {
		const t0 = new Date('2026-11-15T10:00:00.000Z');
		const ready = clinicSurgeryReadyAt(t0);
		expect(ready.getTime() - t0.getTime()).toBe(CLINIC_SURGERY_DURATION_MS);
		expect(clinicSurgeryIsReady(ready, new Date(ready.getTime() - 1))).toBe(false);
		expect(clinicSurgeryIsReady(ready, ready)).toBe(true);
		expect(canStartClinicSurgeryAgain(null, t0)).toBe(true);
		expect(canStartClinicSurgeryAgain(t0, new Date(t0.getTime() + CLINIC_SURGERY_COOLDOWN_MS - 1))).toBe(false);
		expect(canStartClinicSurgeryAgain(t0, new Date(t0.getTime() + CLINIC_SURGERY_COOLDOWN_MS))).toBe(true);
	});

	it('keeps race and palette while selecting rare visual traits', () => {
		const race = raceList[RaceEnum.MOUEFFE];
		expect(chooseClinicSurgeryVisualTraits(race, '00AAAAAAAAAAA111', () => 0.1)).toEqual({
			palette: '1',
			rare1: '1',
			rare2: '1'
		});
	});

	it('may lose rare visual traits but never creates new ones', () => {
		const race = raceList[RaceEnum.MOUEFFE];
		expect(chooseClinicSurgeryVisualTraits(race, '00AAAAAAAAAAA111', () => 0.99)).toEqual({
			palette: '1',
			rare1: '0',
			rare2: '0'
		});
		expect(chooseClinicSurgeryVisualTraits(race, '00AAAAAAAAAAA000', () => 0.1)).toEqual({
			palette: '0',
			rare1: '0',
			rare2: '0'
		});
	});

	it('rejects invalid displays or a race mismatch', () => {
		const race = raceList[RaceEnum.MOUEFFE];
		expect(() => chooseClinicSurgeryVisualTraits(race, 'bad')).toThrow();
		expect(() => chooseClinicSurgeryVisualTraits(race, '10AAAAAAAAAAA000')).toThrow();
	});
});
