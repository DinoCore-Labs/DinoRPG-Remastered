import { describe, expect, it } from 'vitest';

import { getClinicTreatmentCountdown } from '../../src/utils/clinicTreatmentCountdown.js';

describe('Clinic treatment visual countdown', () => {
	const nowMs = Date.parse('2026-11-15T10:00:00.000Z');

	it('shows a countdown during the 1-hour treatment', () => {
		expect(getClinicTreatmentCountdown(true, '2026-11-15T11:00:00.000Z', nowMs)).toEqual({
			secondsLeft: 3600,
			shouldRefresh: false
		});
	});

	it('requests server verification at the deadline without claiming the treatment is finished', () => {
		expect(getClinicTreatmentCountdown(true, '2026-11-15T10:00:00.000Z', nowMs)).toEqual({
			secondsLeft: 0,
			shouldRefresh: true
		});
	});

	it('requests server verification for a missing or invalid deadline', () => {
		expect(getClinicTreatmentCountdown(true, null, nowMs)).toEqual({ secondsLeft: null, shouldRefresh: true });
		expect(getClinicTreatmentCountdown(true, 'invalid', nowMs)).toEqual({ secondsLeft: null, shouldRefresh: true });
	});

	it('stops showing any clinic notice once the server releases the Dinoz', () => {
		expect(getClinicTreatmentCountdown(false, '2026-11-15T09:00:00.000Z', nowMs)).toEqual({
			secondsLeft: null,
			shouldRefresh: false
		});
	});
});
