import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import { z } from 'zod';

export const fightTestSchema = z.object({
	leftTeam: z.array(z.number().int().positive()).min(1),
	rightTeam: z.array(z.number().int().positive()).min(1),
	opponentId: z.string().uuid()
});

export const dojoHistoryPageSchema = z.object({
	page: z.coerce.number().int().positive()
});

export const skipOpponentSchema = z.object({
	dinozId: z.coerce.number().int().positive()
});

export const createMyTeamSchema = z.object({
	team: z.array(z.number().int().positive()).min(1)
});

export const challengeFightSchema = z.object({
	myDinozId: z.coerce.number().int().positive(),
	opponentId: z.coerce.number().int().positive()
});

export const dojoTournamentRequestSchema = z.object({
	id: z.string(),
	phase: z.nativeEnum(TournamentPhase),
	pool: z.coerce.number().int().min(0)
});

export const sharedFightSchema = z.object({
	id: z.string().uuid()
});
