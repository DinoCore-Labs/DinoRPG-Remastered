import { PlaceEnum } from '../enums/PlaceEnum.js';
import { FighterRecap, FightOutcome } from '../fight/fightResult.js';
import { FightStep } from '../fight/fightStep.js';

export type ForcebrutFightResponse = {
	fighters: FighterRecap[];
	goldEarned: number;
	xpEarned: number;
	levelUp: boolean;
	totalHpLost: number;
	result: boolean;
	outcome?: FightOutcome;
	history: FightStep[];
	hpLost: {
		id: number;
		hpLost: number;
	}[];
	itemsUsed: {
		id: number;
		itemsUsed: number[];
	}[];
	place: PlaceEnum;
	statusReward: number | null;
	opponentStep: number;
};
