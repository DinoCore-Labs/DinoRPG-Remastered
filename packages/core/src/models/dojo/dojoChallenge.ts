import { DinozFiche } from '../dinoz/dinozFiche.js';
import { Dojo } from './dojo.js';

export interface DojoOpponents {
	id: String;
	dojoId: String;
	dojo: Dojo;
	dinozId: number;
	dinozfiche: DinozFiche;
	fighted: Boolean;
	achieved: Boolean;
}

export interface DojoTeam {
	id: String;
	dojoId: String;
	dojo: Dojo;
	dinozId: number;
	dinozfiche: DinozFiche;
	fighted: Boolean;
}

export interface DojoChallengeHistory {
	id: string;
	dojoId: string;
	dojo: Dojo;
	myDinozId: Number;
	opponentId: Number;
	challenge: String;
	victory: Boolean;
	achieved: Boolean;
	archivedAt: Date;
}
