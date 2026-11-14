import { defineScenario } from '../scenario.js';

/** Motion Twin: DinoRPG/xml/fr/scenarios.xml and dialogs/infirmiere.xml. */
export const CLINIC_SCENARIO_KEY = 'clinik';

/** Personal dialogue progression; building progress is tracked by the clan. */
export const CLINIC_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	ANNA_REQUEST: 1,
	EUGENE_REFUSED: 2,
	MICHEL_SUGGESTED_WEST: 3,
	WINE_SELLER_AGREED: 4,
	SITE_FOUND: 5,
	CLAN_CONSTRUCTION: 6,
	CONSTRUCTION_REVEALED: 7,
	CLINIC_OPEN: 8,
	TREATMENT_STARTED: 9
} as const;

export const clinicScenario = defineScenario({
	key: CLINIC_SCENARIO_KEY,
	sid: 10,
	nameKey: 'scenarios.clinik.name',
	maxProgression: CLINIC_SCENARIO_STEPS.TREATMENT_STARTED
});
