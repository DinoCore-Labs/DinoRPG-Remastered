export type ScenarioState = {
	step: number;
	updatedAt?: Date | null;
};

export type ConditionsContext = {
	now: Date;
	session: {
		dialogSeed: number;
		tags: Set<string>;
		currentTab?: string;
	};
	dinoz: {
		id: number;
		userId: string;
		level: number;
		life: number;
		placeKey: string;
		statusIds: Set<number>;
		effectKeys: Set<string>;
		skillKeys: Set<string>;
		equipKeys: Set<string>;
		raceKey?: string;
		friendKey?: string | null;
	};
	user: {
		id: string;
		isAdmin: boolean;
		objectKeys: Set<string>;
		ingredientQuantities: Record<string, number>;
		collectionKeys: Set<string>;
		scenarios: Record<string, ScenarioState>;
		uvars: Record<string, number>;
		gvars: Record<string, number>;
		dinozCount: number;
		points: number;
	};
	missions: {
		currentMissionKey?: string;
		currentMissionStep?: number;
		finishedMissionKeys: Set<string>;
	};
	world: {
		activeFeatures: Set<string>;
		activeEvent?: string;
		activePromo?: string;
		activeWar?: string;
		activeConfigs: Set<string>;
		completedDungeonKeys: Set<string>;
		completedClanActionKeys: Set<string>;
		canFightMonsterKeys: Set<string>;
		rockDirectionIndex?: number;
	};
};
