import { DinozFiche } from '../dinoz/dinozFiche.js';
import { Challenge } from './challenge.js';
import { DojoChallengeHistory, DojoOpponents, DojoTeam } from './dojoChallenge.js';
import { TournamentTeam } from './tournament.js';

export interface Dojo {
	id: string;
	userId: number;
	activeChallenge: Challenge;
	reputation: number;
	DojoChallengeHistory: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
	TournamentTeam?: (TournamentTeam & { teamCount?: number }) | null;
}

export interface myTeam {
	team: (Pick<DojoTeam, 'fighted'> & { dinoz: Pick<DinozFiche, 'id' | 'name' | 'level' | 'display'> })[];
	DojoOpponents: (Pick<DojoOpponents, 'fighted' | 'achieved'> & {
		dinoz: Pick<DinozFiche, 'id' | 'name' | 'level' | 'display'>;
	})[];
	activeChallenge: Challenge | null;
	dailyReset: number;
}
