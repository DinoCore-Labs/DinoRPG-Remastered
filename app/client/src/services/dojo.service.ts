import type { DinozDojoFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { Dojo, myTeam } from '@dinorpg/core/models/dojo/dojo.js';
import type { DojoFightResume } from '@dinorpg/core/models/dojo/dojoFightResume.js';
import type { PublicTournament, TournamentHistory, TournamentState } from '@dinorpg/core/models/dojo/tournament.js';
import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import type { FighterRecap, FullFightStats } from '@dinorpg/core/models/fight/fightResult.js';

import { api } from '../utils/http';

export const DojoService = {
	async buildDojo(): Promise<Dojo> {
		return api.post('/dojo/create');
	},

	async getMyDojo(): Promise<{ dojo: Dojo; rank: number; tournament: TournamentState | null }> {
		return api.get('/dojo/my');
	},

	// dojoFight

	async fightTest(
		leftTeam: number[],
		rightTeam: number[],
		opponentId: string
	): Promise<{ fight: DojoFightResume; stats: FullFightStats }> {
		return api.post('/dojo/fightTest', {
			leftTeam,
			rightTeam,
			opponentId
		});
	},

	// history

	async getMyHistory(page: number): Promise<{ archive: { id: string; fighters: FighterRecap[] }[]; quantity: number }> {
		return api.get(`/dojo/history/${page}`);
	},
	async getSharedFight(id: string): Promise<{ fight: DojoFightResume }> {
		return api.get(`/dojo/history/shared/${id}`);
	},
	async getTournamentHistory(page: number): Promise<{ count: number; history: TournamentHistory[] }> {
		return api.get(`/dojo/history/tournament/${page}`);
	},

	//Challenge
	async skipOpponent(dinozId: number): Promise<void> {
		return api.put('/dojo/challenge/skip', { dinozId });
	},
	async createMyTeam(team: number[]): Promise<myTeam> {
		return api.put('/dojo/challenge/createMyTeam', { team });
	},
	async fightChallenge(
		myDinozId: number,
		opponentId: number
	): Promise<{ fight: DojoFightResume; stats: FullFightStats; challengeWon: boolean; victory: boolean }> {
		return api.put('/dojo/challenge/fight', { myDinozId, opponentId });
	},
	async getMyTeam(): Promise<myTeam> {
		return api.get('/dojo/challenge/myTeam');
	},

	// Tournament
	async getTournamentInfo(): Promise<{ id: string; teamRace: number[]; teamSize: number; levelLimit: number }> {
		return api.get('/dojo/tournament/info');
	},
	async getTournamentTeam(): Promise<DinozDojoFiche[]> {
		return api.get('/dojo/tournament/team');
	},
	async getTournamentFights(id: string, phase: TournamentPhase, pool: number): Promise<PublicTournament[]> {
		return api.get(`/dojo/tournament/${phase}/${id}/${pool}`);
	},
	async viewAllFightFromPool(id: string, phase: TournamentPhase, pool: number): Promise<void> {
		return api.patch(`/dojo/tournament/${phase}/${id}/${pool}`);
	},
	async viewAllFightFromFinals(id: string): Promise<void> {
		return api.patch(`/dojo/tournament/${TournamentPhase.FINALS}/${id}/0`);
	},
	async deleteTournamentTeam(): Promise<void> {
		return api.delete('/dojo/tournament/team');
	},
	async createTournamentTeam(team: number[]): Promise<void> {
		return api.post('/dojo/tournament/team', { team });
	}
};
