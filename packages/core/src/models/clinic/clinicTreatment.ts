/**
 * Archive MT : dialogs/infirmiere.xml, status.xml.
 * Le soin dure une heure, le même joueur ne peut en débuter un nouveau
 * qu'après 20 heures (swait(clinik,20)).
 */
export const CLINIC_TREATMENT_DURATION_MS = 60 * 60 * 1000;
export const CLINIC_TREATMENT_COOLDOWN_MS = 20 * 60 * 60 * 1000;

export function canStartClinicTreatmentAgain(lastStart: Date | null | undefined, now: Date): boolean {
	return !lastStart || now.getTime() - lastStart.getTime() >= CLINIC_TREATMENT_COOLDOWN_MS;
}

export function clinicTreatmentReadyAt(startedAt: Date): Date {
	return new Date(startedAt.getTime() + CLINIC_TREATMENT_DURATION_MS);
}

export function clinicTreatmentIsReady(readyAt: Date, now: Date): boolean {
	return readyAt.getTime() <= now.getTime();
}
