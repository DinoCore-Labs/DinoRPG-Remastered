<<<<<<< HEAD
import { jeromeTraderScenario } from './data/jeromeTraderScenario.js';
import { magnetiteScenario } from './data/magnetiteScenario.js';
=======
import { dojoScenario } from './data/dojoScenario.js';
>>>>>>> 2cf879e2 (feat(dojo): add dojo scenario)
import { merguezScenario } from './data/merguezScenario.js';
import { pacScenario } from './data/pacScenario.js';
import { starScenario } from './data/starScenario.js';

export const scenarioList = {
	star: starScenario,
	merguez: merguezScenario,
	pac: pacScenario,
<<<<<<< HEAD
	magnet: magnetiteScenario,
	jerome_trader: jeromeTraderScenario
=======
	dojo: dojoScenario
>>>>>>> 2cf879e2 (feat(dojo): add dojo scenario)
} as const;

export type ScenarioKey = keyof typeof scenarioList;

export const getScenarioDefinition = (scenarioKey: string) => {
	const scenario = scenarioList[scenarioKey as ScenarioKey];
	if (!scenario) {
		throw new Error(`Unknown scenario "${scenarioKey}"`);
	}
	return scenario;
};
