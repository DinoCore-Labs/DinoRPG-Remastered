import { parseDinozDisplay } from '../dinoz/dinozDisplayGenerator.js';
import type { DinozRace } from '../dinoz/dinozRace.js';

/**
 * Original Anna Tomie dialog: one cosmetic operation per month, one hour of immobilisation.
 * We model the monthly limit as a rolling 30-day period per Dinoz.
 */
export const CLINIC_SURGERY_DURATION_MS = 60 * 60 * 1000;
export const CLINIC_SURGERY_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

export function clinicSurgeryReadyAt(startedAt: Date): Date {
	return new Date(startedAt.getTime() + CLINIC_SURGERY_DURATION_MS);
}

export function canStartClinicSurgeryAgain(lastStart: Date | null | undefined, now: Date): boolean {
	return !lastStart || now.getTime() - lastStart.getTime() >= CLINIC_SURGERY_COOLDOWN_MS;
}

export function clinicSurgeryIsReady(readyAt: Date, now: Date): boolean {
	return now.getTime() >= readyAt.getTime();
}

/**
 * Select which rare visual traits remain after surgery.
 * Face generation is delegated to the existing server generateDinozDisplay().
 * The original MT probability is undocumented; 50% is a Remastered rule.
 */
export function chooseClinicSurgeryVisualTraits(
	race: DinozRace,
	currentDisplay: string,
	random: () => number = Math.random
): { palette: string; rare1: string; rare2: string } {
	if (!/^[0-9A-Za-z]{16}$/.test(currentDisplay) || currentDisplay.slice(0, 1) !== race.swfLetter.slice(0, 1)) {
		throw new Error('Invalid Dinoz display for cosmetic surgery');
	}
	const original = parseDinozDisplay(currentDisplay);
	return {
		palette: original.palette,
		rare1: original.rare1 !== '0' && random() < 0.5 ? original.rare1 : '0',
		rare2: original.rare2 !== '0' && random() < 0.5 ? original.rare2 : '0'
	};
}
