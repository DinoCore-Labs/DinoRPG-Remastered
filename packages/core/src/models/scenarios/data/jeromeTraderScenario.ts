import { defineScenario } from '../scenario.js';

export const JEROME_TRADER_SCENARIO_KEY = 'jerome_trader';

export const JEROME_TRADER_SCENARIO_STEPS = {
	NOT_STARTED: 0,
	STOCK_DELIVERED: 1,
	COMPLETED: 2
} as const;

export const jeromeTraderScenario = defineScenario({
	key: JEROME_TRADER_SCENARIO_KEY,
	sid: 5,
	nameKey: 'scenarios.jeromeTrader.name',
	maxProgression: JEROME_TRADER_SCENARIO_STEPS.COMPLETED
});
