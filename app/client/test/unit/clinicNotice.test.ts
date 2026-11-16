import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { getClinicNoticeKey } from '../../src/utils/clinicNotice.js';

describe('clinic operation labels', () => {
	it('shows the healing label during a treatment and while checking completion', () => {
		expect(getClinicNoticeKey('treatment', 60)).toBe('clinicTreatment.waiting');
		expect(getClinicNoticeKey('treatment', 0)).toBe('clinicTreatment.verifying');
	});

	it('shows a distinct label during surgery and while checking completion', () => {
		expect(getClinicNoticeKey('surgery', 60)).toBe('clinicTreatment.surgeryWaiting');
		expect(getClinicNoticeKey('surgery', 0)).toBe('clinicTreatment.surgeryVerifying');
	});

	it('preserves the generic verification text when operation metadata is missing', () => {
		expect(getClinicNoticeKey(undefined, null)).toBe('clinicTreatment.verifying');
		expect(getClinicNoticeKey(null, 10)).toBe('clinicTreatment.waiting');
	});

	it.each(['FR', 'EN', 'ES', 'DE'])('provides translated notices in %s', language => {
		const url = new URL(`../../src/i18n/locales/${language}.json`, import.meta.url);
		const messages = JSON.parse(readFileSync(url, 'utf8')) as {
			clinic: Record<string, string>;
			clinicTreatment: Record<string, string>;
		};
		for (const name of ['waiting', 'verifying', 'surgeryWaiting', 'surgeryVerifying']) {
			expect(messages.clinicTreatment[name]?.length).toBeGreaterThan(0);
		}
		expect(messages.clinicTreatment.surgeryWaiting).toContain('{time}');
		expect(messages.clinic.surgeryRequirements).toBeUndefined();
	});
});
