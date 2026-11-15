import { TournamentPhase } from '../dojo/tournament.js';

export interface AdminTournamentSchedule {
	qualificationStart: string;
	qualificationEnd: string;
	poolsStart: string;
	finalsStart: string;
}

export interface AdminTournamentState {
	id: string;
	phase: TournamentPhase;
	round: number;
	nextScheduledMatch: string;
	schedule: AdminTournamentSchedule;
	cashPrice: number;
	levelLimit: number;
	itemsAllowed: boolean;
	teamSize: number;
	teamRace: string;
	raceMinimum: number;
	poison: boolean;
	formatName: string;
}

export interface AdminTournamentJobStatus {
	key: string;
	name: string;
	enabled: boolean;
	nextRunAt: string | null;
	lastRunAt: string | null;
	status: string;
}

export interface AdminTournamentOverview {
	current: AdminTournamentState | null;
	pendingStep: string | null;
	jobs: AdminTournamentJobStatus[];
}

export interface AdminCreateTournamentPayload {
	startDate?: string;
	teamSize?: number;
	levelLimit?: number;
	poison?: boolean;
	itemsAllowed?: boolean;
	cashPrice?: number;
}

export interface AdminTournamentActionResponse {
	message: string;
}
