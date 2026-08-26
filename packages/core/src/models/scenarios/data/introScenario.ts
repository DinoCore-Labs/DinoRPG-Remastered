import { defineScenario } from '../scenario.js';

export const INTRO_SCENARIO_KEY = 'intro';

export const IntroProgression = {
	NOT_STARTED: 0,
	MICHEL_SPOKEN: 1,
	PORT_COMPLETED: 2,
	WAIKIKI_COMPLETED: 3,
	SWAMP_COMPLETED: 4,
	FALLS_REACHED: 5,
	COMPLETED: 6
} as const;

export const introScenario = defineScenario({
	key: INTRO_SCENARIO_KEY,
	sid: 7,
	nameKey: 'scenarios.intro.name',
	maxProgression: IntroProgression.COMPLETED
});
