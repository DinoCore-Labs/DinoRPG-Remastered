export type GatherReward =
	| {
			kind: 'ingredient';
			keys: string[];
	  }
	| {
			kind: 'item';
			keys: string[];
			quantity?: number;
	  }
	| {
			kind: 'gold';
			amount: number;
	  };

export interface GatherFound {
	reward: GatherReward;
	count: number;
	condition?: string;
}
