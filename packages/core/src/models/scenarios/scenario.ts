export type ScenarioDefinition = {
	key: string;
	sid: number;
	nameKey: string;
	maxProgression: number;
};

export const defineScenario = <T extends ScenarioDefinition>(scenario: T): T => scenario;
