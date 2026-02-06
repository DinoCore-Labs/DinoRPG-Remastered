import { FightResult } from '../fight/fightResult.js';
//import { LiveStatsType } from './LiveStats.mjs';

export interface StateSessionStore {
	fight?: FightResult;
	fromFight: boolean;
	tabDinoz: number;
	tabAccount: number;

	//liveStats: LiveStatsType;
}
