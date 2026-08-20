import { DinozDojoFiche } from '../dinoz/dinozFiche.js';
import { Challenge } from '../dojo/challenge.js';
import { DojoChallengeHistory } from '../dojo/dojoChallenge.js';
import { TournamentState, TournamentTeam } from '../dojo/tournament.js';

export interface DojoStore {
	dojoId?: string;
	activeChallenge?: Challenge;
	reputation: number;
	DojoChallengeHistory?: Pick<DojoChallengeHistory, 'victory' | 'achieved'>[];
	TournamentTeam?: (TournamentTeam & { teamCount?: number }) | null;
	currentTournament: TournamentState | null;
	rank: number;
	worth: number;
	tournamentInfo?: { id: string; teamRace: number[]; teamSize: number; levelLimit: number };
	myTeam: DinozDojoFiche[];
}
