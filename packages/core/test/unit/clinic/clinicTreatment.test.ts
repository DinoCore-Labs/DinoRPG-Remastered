import { describe, expect, it } from 'vitest';

import {
	canStartClinicTreatmentAgain,
	CLINIC_TREATMENT_COOLDOWN_MS,
	CLINIC_TREATMENT_DURATION_MS,
	clinicTreatmentIsReady,
	clinicTreatmentReadyAt
} from '../../../src/models/clinic/clinicTreatment.js';

describe('MT clinic treatment delays', () => {
	const started = new Date('2026-11-14T09:00:00.000Z');
	it('finishes after exactly one hour', () => {
		const ready = clinicTreatmentReadyAt(started);
		expect(ready.getTime() - started.getTime()).toBe(60 * 60 * 1000);
		expect(clinicTreatmentIsReady(ready, new Date(ready.getTime() - 1))).toBe(false);
		expect(clinicTreatmentIsReady(ready, ready)).toBe(true);
		expect(CLINIC_TREATMENT_DURATION_MS).toBe(3_600_000);
	});
	it('allows a new treatment only after 20 hours, not after one hour', () => {
		expect(canStartClinicTreatmentAgain(null, started)).toBe(true);
		expect(canStartClinicTreatmentAgain(started, new Date(started.getTime() + 3_600_000))).toBe(false);
		expect(canStartClinicTreatmentAgain(started, new Date(started.getTime() + CLINIC_TREATMENT_COOLDOWN_MS - 1))).toBe(
			false
		);
		expect(canStartClinicTreatmentAgain(started, new Date(started.getTime() + CLINIC_TREATMENT_COOLDOWN_MS))).toBe(
			true
		);
	});
});
