import type {
	AdminCreateTournamentPayload,
	AdminTournamentActionResponse,
	AdminTournamentOverview,
	AdminTournamentState
} from '@dinorpg/core/models/admin/adminTournament.js';
import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import {
	TOURNAMENT_FINALS_R0_JOB_KEY,
	TOURNAMENT_FINALS_R1_JOB_KEY,
	TOURNAMENT_FINALS_R2_JOB_KEY,
	TOURNAMENT_FINALS_R3_JOB_KEY,
	TOURNAMENT_FINALS_R4_JOB_KEY,
	TOURNAMENT_INIT_JOB_KEY,
	TOURNAMENT_POOLS_R1_JOB_KEY,
	TOURNAMENT_POOLS_R2_JOB_KEY,
	TOURNAMENT_POOLS_START_JOB_KEY,
	TournamentManager
} from '../../utils/tournamentManager.js';

const TOURNAMENT_ALL_KEYS = [
	TOURNAMENT_INIT_JOB_KEY,
	TOURNAMENT_POOLS_START_JOB_KEY,
	TOURNAMENT_POOLS_R1_JOB_KEY,
	TOURNAMENT_POOLS_R2_JOB_KEY,
	TOURNAMENT_FINALS_R0_JOB_KEY,
	TOURNAMENT_FINALS_R1_JOB_KEY,
	TOURNAMENT_FINALS_R2_JOB_KEY,
	TOURNAMENT_FINALS_R3_JOB_KEY,
	TOURNAMENT_FINALS_R4_JOB_KEY
];

export async function getPendingStep(): Promise<string | null> {
	const tournament = await TournamentManager.getCurrentTournament(prisma);
	if (!tournament) return TOURNAMENT_INIT_JOB_KEY;

	const lastFight = await prisma.fightArchive.findFirst({
		where: { tournamentId: tournament.id },
		orderBy: { tournamentStep: 'desc' }
	});

	const step = lastFight?.tournamentStep ?? null;

	if (tournament.phase === TournamentPhase.QUALIFICATION) {
		const poolsAssigned =
			(await prisma.tournamentTeam.count({
				where: { tournamentId: tournament.id, poolNumber: { not: null } }
			})) > 0;
		return poolsAssigned ? TOURNAMENT_POOLS_R1_JOB_KEY : TOURNAMENT_POOLS_START_JOB_KEY;
	}

	if (tournament.phase === TournamentPhase.POOLS) {
		if (step === null || step === undefined) return TOURNAMENT_POOLS_START_JOB_KEY;
		if (step < 1) return TOURNAMENT_POOLS_R1_JOB_KEY;
		if (step < 2) return TOURNAMENT_POOLS_R2_JOB_KEY;
		return TOURNAMENT_FINALS_R0_JOB_KEY;
	}

	if (tournament.phase === TournamentPhase.FINALS) {
		if (step === null || step < 10) return TOURNAMENT_FINALS_R0_JOB_KEY;
		const finalsStep = step - 10; // FINALS_STEP_OFFSET = 10
		if (finalsStep === 0) return TOURNAMENT_FINALS_R1_JOB_KEY;
		if (finalsStep === 1) return TOURNAMENT_FINALS_R2_JOB_KEY;
		if (finalsStep === 2) return TOURNAMENT_FINALS_R3_JOB_KEY;
		if (finalsStep === 3) return TOURNAMENT_FINALS_R4_JOB_KEY;
		// Finals already played
		return TOURNAMENT_INIT_JOB_KEY;
	}

	return TOURNAMENT_INIT_JOB_KEY;
}

async function executeTournamentStep(key: string, options?: AdminCreateTournamentPayload): Promise<string> {
	let message = '';
	switch (key) {
		case TOURNAMENT_INIT_JOB_KEY:
			await TournamentManager.initTournamentJob(prisma, true, options);
			message = 'Nouveau tournoi créé, règles publiées et étapes automatiques programmées !';
			break;
		case TOURNAMENT_POOLS_START_JOB_KEY:
			await TournamentManager.poolsStartJob(prisma, true);
			message = 'Qualifications terminées, poules générées et Round 0 joué !';
			break;
		case TOURNAMENT_POOLS_R1_JOB_KEY:
			await TournamentManager.poolsRound1Job(prisma, true);
			message = 'Round 1 des poules joué !';
			break;
		case TOURNAMENT_POOLS_R2_JOB_KEY:
			await TournamentManager.poolsRound2Job(prisma, true);
			message = 'Round 2 des poules joué et arbre des finales généré !';
			break;
		case TOURNAMENT_FINALS_R0_JOB_KEY:
			await TournamentManager.finalsRoundJob(0, prisma, true);
			message = '1/16 de finale joués !';
			break;
		case TOURNAMENT_FINALS_R1_JOB_KEY:
			await TournamentManager.finalsRoundJob(1, prisma, true);
			message = '1/8 de finale joués !';
			break;
		case TOURNAMENT_FINALS_R2_JOB_KEY:
			await TournamentManager.finalsRoundJob(2, prisma, true);
			message = 'Quarts de finale joués !';
			break;
		case TOURNAMENT_FINALS_R3_JOB_KEY:
			await TournamentManager.finalsRoundJob(3, prisma, true);
			message = 'Demi-finales jouées !';
			break;
		case TOURNAMENT_FINALS_R4_JOB_KEY:
			await TournamentManager.finalsRoundJob(4, prisma, true);
			message = 'Finale jouée, récompenses distribuées et news de fin publiée !';
			break;
		default:
			throw new Error(`Clé de job de tournoi inconnue: "${key}".`);
	}

	await prisma.jobDefinition.updateMany({
		where: { key },
		data: {
			enabled: false,
			status: 'SUCCESS',
			lastRunAt: new Date()
		}
	});

	return message;
}

// ---------------------------------------------------------------------------
// Handlers HTTP
// ---------------------------------------------------------------------------

export async function getAdminTournamentOverviewHandler(
	_req: FastifyRequest,
	_reply: FastifyReply
): Promise<AdminTournamentOverview> {
	const state = await TournamentManager.getCurrentTournament(prisma);
	const pendingStep = await getPendingStep();

	const dbJobs = await prisma.jobDefinition.findMany({
		where: { key: { in: TOURNAMENT_ALL_KEYS } }
	});

	const jobs = TOURNAMENT_ALL_KEYS.map(key => {
		const found = dbJobs.find(j => j.key === key);
		return {
			key,
			name: found?.name ?? key,
			enabled: found?.enabled ?? false,
			nextRunAt: found?.nextRunAt ? found.nextRunAt.toISOString() : null,
			lastRunAt: found?.lastRunAt ? found.lastRunAt.toISOString() : null,
			status: found?.status ?? 'DISABLED'
		};
	});

	if (!state) {
		return { current: null, pendingStep, jobs };
	}

	const dbTournament = await prisma.tournament.findUnique({
		where: { id: state.id },
		select: { teamSize: true, teamRace: true, raceMinimum: true, poison: true, formatName: true }
	});

	const current: AdminTournamentState = {
		id: state.id,
		phase: state.phase,
		round: state.round,
		nextScheduledMatch: state.nextScheduledMatch.toISOString(),
		schedule: {
			qualificationStart: state.schedule.qualificationStart.toISOString(),
			qualificationEnd: state.schedule.qualificationEnd.toISOString(),
			poolsStart: state.schedule.poolsStart.toISOString(),
			finalsStart: state.schedule.finalsStart.toISOString()
		},
		cashPrice: state.cashPrice,
		levelLimit: state.levelLimit,
		itemsAllowed: state.itemsAllowed,
		teamSize: dbTournament?.teamSize ?? 0,
		teamRace: dbTournament?.teamRace ?? '',
		raceMinimum: dbTournament?.raceMinimum ?? 0,
		poison: dbTournament?.poison ?? false,
		formatName: dbTournament?.formatName ?? ''
	};

	return { current, pendingStep, jobs };
}

export async function createAdminTournamentHandler(
	req: FastifyRequest,
	_reply: FastifyReply
): Promise<AdminTournamentActionResponse> {
	const body = (req.body ?? {}) as AdminCreateTournamentPayload;
	const message = await executeTournamentStep(TOURNAMENT_INIT_JOB_KEY, body);
	return { message };
}

export async function runAdminTournamentNextStepHandler(
	_req: FastifyRequest,
	reply: FastifyReply
): Promise<AdminTournamentActionResponse> {
	const pendingStep = await getPendingStep();

	if (!pendingStep) {
		return reply.code(400).send({ message: 'Aucune étape à lancer pour le moment.' });
	}

	const message = await executeTournamentStep(pendingStep);
	return { message };
}

export async function runAdminTournamentStepByKeyHandler(
	req: FastifyRequest,
	reply: FastifyReply
): Promise<AdminTournamentActionResponse> {
	const { key } = req.params as { key: string };

	if (!TOURNAMENT_ALL_KEYS.includes(key)) {
		return reply.code(400).send({ message: `Clé de job de tournoi inconnue: "${key}".` });
	}

	const message = await executeTournamentStep(key);
	return { message };
}
