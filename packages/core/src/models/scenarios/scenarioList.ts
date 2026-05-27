import { merguezScenario } from './data/merguezScenario.js';
import { pacScenario } from './data/pacScenario.js';
import { starScenario } from './data/starScenario.js';

export const scenarioList = {
	star: starScenario,
	merguez: merguezScenario,
	pac: pacScenario
} as const;

export type ScenarioKey = keyof typeof scenarioList;

export const getScenarioDefinition = (scenarioKey: string) => {
	const scenario = scenarioList[scenarioKey as ScenarioKey];
	if (!scenario) {
		throw new Error(`Unknown scenario "${scenarioKey}"`);
	}
	return scenario;
};
