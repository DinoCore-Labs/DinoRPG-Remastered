/**
 * Etat purement visuel du minuteur des soins de la clinique.
 * Seul le serveur peut confirmer la fin du traitement en retirant l'etat `clinic`.
 */
export function getClinicTreatmentCountdown(
	isBeingTreated: boolean,
	readyAt: string | null | undefined,
	nowMs: number = Date.now()
): { secondsLeft: number | null; shouldRefresh: boolean } {
	if (!isBeingTreated) {
		return { secondsLeft: null, shouldRefresh: false };
	}
	if (!readyAt) {
		return { secondsLeft: null, shouldRefresh: true };
	}
	const readyAtMs = Date.parse(readyAt);
	if (!Number.isFinite(readyAtMs)) {
		return { secondsLeft: null, shouldRefresh: true };
	}
	const secondsLeft = Math.max(0, Math.ceil((readyAtMs - nowMs) / 1000));
	return { secondsLeft, shouldRefresh: secondsLeft === 0 };
}
