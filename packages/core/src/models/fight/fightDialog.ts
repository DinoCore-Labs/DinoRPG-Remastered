export type FightText =
	| {
			type: 'message' | 'announce';
			text: string;
	  }
	| {
			type: 'talk';
			text: string;
			speakerFid: number;
	  };
