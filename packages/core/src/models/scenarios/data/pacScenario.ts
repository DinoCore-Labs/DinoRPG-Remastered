import { defineScenario } from '../scenario.js';

export const PAC_SCENARIO_KEY = 'pac';

export const PAC_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	COMPLETED: 1
} as const;

export const pacScenario = defineScenario({
	key: PAC_SCENARIO_KEY,
	sid: 3,
	nameKey: 'scenarios.pac.name',
	maxProgression: PAC_SCENARIO_STEPS.COMPLETED
});
