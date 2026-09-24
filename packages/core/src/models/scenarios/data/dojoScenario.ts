import { defineScenario } from '../scenario.js';

export const DOJO_SCENARIO_KEY = 'dojo';

export const DOJO_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	UNLOCKED: 1,
	BUILT: 2
} as const;

export const dojoScenario = defineScenario({
	key: DOJO_SCENARIO_KEY,
	sid: 6,
	nameKey: 'scenarios.dojo.name',
	maxProgression: DOJO_SCENARIO_STEPS.BUILT
});
