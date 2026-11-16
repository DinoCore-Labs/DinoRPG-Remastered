import type { ClinicActivityStatus } from '@dinorpg/core/models/clinic/clinicActivity.js';

/** The countdown is visual; the server confirms completion of the operation. */
export function getClinicNoticeKey(
	kind: ClinicActivityStatus['kind'] | null | undefined,
	secondsLeft: number | null
): string {
	const waiting = secondsLeft !== null && secondsLeft > 0;
	if (kind === 'surgery') {
		return waiting ? 'clinicTreatment.surgeryWaiting' : 'clinicTreatment.surgeryVerifying';
	}
	return waiting ? 'clinicTreatment.waiting' : 'clinicTreatment.verifying';
}
