import { PlaceEnum } from '../enums/PlaceEnum.js';

export interface TournamentMatch {
	id: string;
	round: number;
	phase: TournamentPhase;
	matchNumber?: number;
	poolNumber?: number;
	scheduledFor: Date;
	winner: string;
}

export interface TournamentSchedule {
	qualificationStart: Date;
	qualificationEnd: Date;
	poolsStart: Date;
	finalsStart: Date;
}

export type RawTournamentMatch = {
	team: string | null;
	poolNumber: number;
	matchNumber: number;
};

export type TournamentPool = {
	match: number;
	right: string | null;
	left: string | null;
};

export type TournamentPools = {
	poolId: number;
	matches: TournamentPool[];
};

export interface TournamentState {
	id: string;
	phase: TournamentPhase;
	round: number;
	nextScheduledMatch: Date;
	schedule: TournamentSchedule;
	cashPrice: number;
	levelLimit: number;
	itemsAllowed: boolean;
}

export type MetaData = {
	phase: TournamentPhase;
	round: number;
	poolNumber: number;
	matchNumber: number;
	scheduledFor: string;
	team1Id: string | null;
	team2Id: string | null;
	place: PlaceEnum;
};

export type PublicMetada = {
	phase: TournamentPhase;
	round: number;
	poolNumber: number;
	matchNumber: number;
	scheduledFor: Date;
	team1Id: string;
	team2Id: string;
	place: PlaceEnum;
};

export interface TournamentPlayer {
	id: string;
	name: string;
}

export interface PublicTournament {
	id: string;
	tournamentTeamLeft: TournamentTeam | null;
	tournamentTeamRight: TournamentTeam | null;
	metadata: PublicMetada;
	result: boolean;
	watched: boolean;
}

export interface TournamentHistory {
	id: string;
	date: string;
	formatName: string;
}

export type TournamentTeam = {
	dinoz: TeamLeader;
	user: TournamentPlayer | null;
};

export type TeamLeader = {
	id: number;
	display: string;
	name: string;
};

export type DisplayedLeader = {
	dinoz: TeamLeader | null;
	fight: string;
	won: boolean;
	round: number;
	pool: number;
	matchNumber: number;
	watched: boolean;
	show: boolean;
	slot: 'left' | 'right';
	player: TournamentPlayer | null;
	opponent: TournamentPlayer | null;
};

export enum TournamentPhase {
	QUALIFICATION = 'qualification',
	POOLS = 'pools',
	FINALS = 'finals'
}
