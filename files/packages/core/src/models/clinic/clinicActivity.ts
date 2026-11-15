/** Server-authored, read-only status for a pending clinic operation. */
export type ClinicActivityStatus = {
	kind: 'treatment' | 'surgery';
	/** Completion time from ClinicTreatment.readyAt or DinozSurgery.readyAt. */
	readyAt: string;
};
