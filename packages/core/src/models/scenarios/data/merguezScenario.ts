import { defineScenario } from '../scenario.js';

export const merguezScenario = defineScenario({
	key: 'merguez',
	sid: 2,
	nameKey: 'scenarios.merguez.name',
	maxProgression: 5
});

export const MERGUEZ_SCENARIO_KEY = 'merguez';
export const MERGUEZ_CARD_REWARD_KEY = 'merguez_card';

export const MERGUEZ_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	STARTED: 1,
	FIRST_REPORT: 2,
	FIRST_REPORT_DONE: 3,
	FINAL_REPORT: 4,
	COMPLETED: 5
} as const;

export const MERGUEZ_SCENARIO_THRESHOLDS = {
	FIRST_REPORT_USED_COUNT: 100,
	FINAL_REPORT_USED_COUNT: 500
} as const;

export const MERGUEZ_DEFAULT_GIFT_COUNT = 5;
export const MERGUEZ_CARD_GIFT_COUNT = 100;

export const MERGUEZ_DEFAULT_MAX_QUANTITY = 20;
export const MERGUEZ_CARD_MAX_QUANTITY = 100;
export const MERGUEZ_SHOPKEEPER_MAX_QUANTITY = 150;
