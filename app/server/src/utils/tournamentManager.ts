import { Language } from '@dinorpg/core/models/config/language.js';
import {
	FINAL_BRACKET_SIZE,
	POOL_COUNT,
	POOL_LOSS_COUNT,
	POOL_SIZE,
	POOL_WIN_COUNT
} from '@dinorpg/core/models/dojo/constants.js';
import { formatName, formatTID } from '@dinorpg/core/models/dojo/teamFormat.js';
import {
	type MetaData,
	type RawTournamentMatch,
	TournamentPhase,
	type TournamentState
} from '@dinorpg/core/models/dojo/tournament.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { RewardEnum } from '@dinorpg/core/models/enums/Parser.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';
import { NewsType } from '@dinorpg/core/models/news/news.js';
import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';
import { Reward } from '@dinorpg/core/models/rewards/rewardList.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';

import { getDinozForDojoFight } from '../Dojo/Service/dojoTest.service.js';
import { calculateFightBetweenPlayers } from '../Fight/Service/fight.service.js';
import { addItemToInventory } from '../Inventory/Controller/addItem.controller.js';
import { newsService } from '../News/Service/news.service.js';
import { newNotif } from '../Notification/Service/notification.service.js';
import { prisma } from '../prisma.js';
import { addMoney } from '../User/Controller/money.controller.js';
import type { FightRules } from '../utils/fight/fight.mapper.js';

// ---------------------------------------------------------------------------
// Job keys
// ---------------------------------------------------------------------------
//

//
//   Sun 00:00  TOURNAMENT_INIT_JOB_KEY      — create tournament, open qualifications
//   Sun 00:00  TOURNAMENT_POOLS_START_JOB_KEY — (1 week later) close qualifications, assign pools, play round 0
//   Mon 12:00  TOURNAMENT_POOLS_R1_JOB_KEY  — round 1 pool
//   Mon 22:00  TOURNAMENT_POOLS_R2_JOB_KEY  — round 2 pool
//   Wed 12:00  TOURNAMENT_FINALS_R0_JOB_KEY — 1/16 (32→16)
//   Thu 12:00  TOURNAMENT_FINALS_R1_JOB_KEY — 1/8 (16→8)
//   Fri 12:00  TOURNAMENT_FINALS_R2_JOB_KEY — 1/4 (8→4)
//   Sat 12:00  TOURNAMENT_FINALS_R3_JOB_KEY — 1/2 (4→2)
//   Sun 12:00  TOURNAMENT_FINALS_R4_JOB_KEY — final (2→1)
//

export const TOURNAMENT_INIT_JOB_KEY = 'tournament-init'; // sun 00:00
export const TOURNAMENT_POOLS_START_JOB_KEY = 'tournament-pools-start'; // sun 00:00 (next week)
export const TOURNAMENT_POOLS_R1_JOB_KEY = 'tournament-pools-round-1'; // mon 12:00
export const TOURNAMENT_POOLS_R2_JOB_KEY = 'tournament-pools-round-2'; // mon 22:00
export const TOURNAMENT_FINALS_R0_JOB_KEY = 'tournament-finals-r0'; // wed 12:00
export const TOURNAMENT_FINALS_R1_JOB_KEY = 'tournament-finals-r1'; // thu 12:00
export const TOURNAMENT_FINALS_R2_JOB_KEY = 'tournament-finals-r2'; // fri 12:00
export const TOURNAMENT_FINALS_R3_JOB_KEY = 'tournament-finals-r3'; // sat 12:00
export const TOURNAMENT_FINALS_R4_JOB_KEY = 'tournament-finals-r4'; // sun 12:00

// ---------------------------------------------------------------------------
// Fixed 5-match GSL bracket per pool of 4 (2 wins → qualify, 2 losses → out)
//
//   Round 0:  M1: seedA vs seedB     M2: seedC vs seedD
//   Round 1:  M3: W(M1) vs W(M2)    — winner qualifies 2-0
//             M4: L(M1) vs L(M2)    — loser eliminated 0-2
//   Round 2:  M5: L(M3) vs W(M4)   — winner qualifies 2-1, loser eliminated 1-2
// ---------------------------------------------------------------------------
interface MatchDep {
	matchNumber: number;
	result: 'winner' | 'loser';
}
interface PoolMatchPlan {
	matchNumber: number;
	round: number;
	leftFrom: MatchDep | null;
	rightFrom: MatchDep | null;
}

const POOL_MATCH_PLAN: PoolMatchPlan[] = [
	{ matchNumber: 1, round: 0, leftFrom: null, rightFrom: null },
	{ matchNumber: 2, round: 0, leftFrom: null, rightFrom: null },
	{
		matchNumber: 3,
		round: 1,
		leftFrom: { matchNumber: 1, result: 'winner' },
		rightFrom: { matchNumber: 2, result: 'winner' }
	},
	{
		matchNumber: 4,
		round: 1,
		leftFrom: { matchNumber: 1, result: 'loser' },
		rightFrom: { matchNumber: 2, result: 'loser' }
	},
	{
		matchNumber: 5,
		round: 2,
		leftFrom: { matchNumber: 3, result: 'loser' },
		rightFrom: { matchNumber: 4, result: 'winner' }
	}
];

const TOURNAMENT_RULES: FightRules = {
	canUseCapture: false,
	castleFight: false,
	enableStats: false,
	poisonEnabled: false,
	canUseEquipment: true,
	canUsePermanentEquipmentOnly: true
};

const FINALS_STEP_OFFSET = 10;
// round 0 (1/16) → tournamentStep 10, round 1 (1/8) → 11, …, round 4 (finale) → 14

// ---------------------------------------------------------------------------

export class TournamentManager {
	static async getCurrentTournamentState(prismaClient = prisma): Promise<TournamentState | null> {
		return TournamentManager.getCurrentTournament(prismaClient);
	}

	static async getCurrentTournament(prismaClient = prisma): Promise<TournamentState | null> {
		const currentDate = new Date();
		const tournament = await prismaClient.tournament.findFirst({ orderBy: { date: 'desc' } });
		if (!tournament) return null;

		const qualificationStart = new Date(tournament.date);
		const qualificationEnd = new Date(tournament.date);
		qualificationEnd.setDate(qualificationEnd.getDate() + 7);
		const poolsStart = new Date(qualificationEnd);
		const finalsStart = new Date(poolsStart);
		finalsStart.setDate(finalsStart.getDate() + 2); // tuesday 00:00

		const PHASE_TOLERANCE_MS = 60_000;

		let phase: TournamentPhase = TournamentPhase.QUALIFICATION;
		if (currentDate >= new Date(qualificationEnd.getTime() - PHASE_TOLERANCE_MS) && currentDate < finalsStart)
			phase = TournamentPhase.POOLS;
		else if (currentDate >= finalsStart) phase = TournamentPhase.FINALS;

		const lastFight = await prismaClient.fightArchive.findFirst({
			where: { tournamentId: tournament.id },
			orderBy: { tournamentStep: 'desc' }
		});

		return {
			id: tournament.id,
			phase,
			round: lastFight ? lastFight.tournamentStep + 1 : 0,
			nextScheduledMatch: tournament.nextRound,
			schedule: { qualificationStart, qualificationEnd, poolsStart, finalsStart },
			cashPrice: tournament.cashPrice,
			levelLimit: tournament.levelLimit,
			itemsAllowed: tournament.itemsAllowed
		};
	}

	// -------------------------------------------------------------------------
	// Job handlers
	// -------------------------------------------------------------------------

	/**
	 * Sunday 00:00 UTC — week 1.
	 * Creates a new tournament, opens qualifications for 1 week.
	 */

	static async initTournamentJob(prismaClient = prisma): Promise<void> {
		const existing = await TournamentManager.getCurrentTournament(prismaClient);
		if (existing && existing.phase !== TournamentPhase.FINALS) return;

		const now = new Date();
		const qualificationEnd = new Date(now.getTime() + 7 * 24 * 3600 * 1000);

		//fixed FFA format for now.
		const format = formatTID[formatName.FFA];

		const itemsAllowed = Math.random() < 0.5;
		const poison = Math.random() < 0.5;
		const tournament = await prismaClient.tournament.create({
			data: {
				date: now,
				levelLimit: 35,
				raceMinimum: format.raceMinimum,
				teamRace: format.teamRace.join(','),
				teamSize: format.teamSize || 4,
				cashPrice: 0,
				poison,
				itemsAllowed,
				nextRound: qualificationEnd
			}
		});

		// Reset dojo qualification rankings and challenge history for the new tournament
		await prismaClient.dojo.updateMany({
			data: {
				reputation: 0,
				dailyReset: 0,
				tournamentTeamId: null
			}
		});
		await prismaClient.ranking.updateMany({
			data: {
				dojo: 0
			}
		});
		await prismaClient.dojoChallengeHistory.deleteMany({});
		await prismaClient.dojoOpponents.deleteMany({});

		const slug = `tournament-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

		// Paramètres dynamiques injectés dans la traduction
		const params = JSON.stringify({
			edition: tournament.id, // Ou dynamique selon l'ID
			formatName: format.name,
			endDate: qualificationEnd.toISOString(),
			teamSize: tournament.teamSize,
			raceMinimum: tournament.raceMinimum,
			races: tournament.teamRace,
			levelLimit: tournament.levelLimit,
			poison: tournament.poison,
			itemsAllowed: tournament.itemsAllowed
		});

		await newsService.createAdminNews({
			slug,
			type: NewsType.TID_START,
			isPublished: true,
			publishedAt: now,
			translations: [
				{
					lang: Language.FR,
					title: 'news.tournament.start.title',
					excerpt: `news.tournament.start.excerpt|${params}`,
					content: `news.tournament.start.content|${params}`
				},
				{
					lang: Language.EN,
					title: 'news.tournament.start.title',
					excerpt: `news.tournament.start.excerpt|${params}`,
					content: `news.tournament.start.content|${params}`
				}
			]
		});
	}

	/**
	 * Sunday 00:00 UTC — week 2.
	 * Closes qualifications, assigns pools and plays immediately the round 0
	 * (M1 and M2 of each pool).
	 */
	static async poolsStartJob(prismaClient = prisma): Promise<void> {
		const tournament = await TournamentManager.getCurrentTournament(prismaClient);
		if (!tournament || tournament.phase !== TournamentPhase.POOLS) return;

		await TournamentManager.rewardQualification();
		await TournamentManager.generatePoolBrackets(tournament.id, tournament.schedule.poolsStart, prismaClient);
	}

	/**
	 * Monday 12:00 UTC — round 1 of the pools (M3 winners, M4 losers).
	 */
	static async poolsRound1Job(prismaClient = prisma): Promise<void> {
		await TournamentManager.schedulePoolRound(1, prismaClient);
	}

	/**
	 * Monday 22:00 UTC — round 2 of the pools (M5 decider).
	 */
	static async poolsRound2Job(prismaClient = prisma): Promise<void> {
		await TournamentManager.schedulePoolRound(2, prismaClient);

		// After round 2, all pools are completed → final bracket
		const tournament = await TournamentManager.getCurrentTournament(prismaClient);
		if (tournament) {
			await TournamentManager.generateFinalBracket(tournament.id, prismaClient);
		}
	}

	/**
	 * Wednesday 12:00 → Sunday 12:00 UTC — final bracket rounds.
	 */
	static async finalsRoundJob(finalsRound: number, prismaClient = prisma): Promise<void> {
		const tournament = await TournamentManager.getCurrentTournament(prismaClient);

		if (!tournament || tournament.phase !== TournamentPhase.FINALS) return;

		const tournamentStep = FINALS_STEP_OFFSET + finalsRound;

		const dbTournament = await prismaClient.tournament.findUniqueOrThrow({
			where: { id: tournament.id },
			select: { poison: true, itemsAllowed: true }
		});
		if (finalsRound !== 0) {
			const previousStep = FINALS_STEP_OFFSET + finalsRound - 1;
			const previousFights = await prismaClient.fightArchive.findMany({
				where: { tournamentId: tournament.id, tournamentStep: previousStep },
				select: { result: true, tournamentTeamLeftId: true, tournamentTeamRightId: true }
			});
			if (previousFights.length === 0) return;
		}
		// -------------------------------------------------------------------------
		// Round 0 (1/16)
		// -------------------------------------------------------------------------
		if (finalsRound === 0) {
			const seededTeams = await prismaClient.tournamentTeam.findMany({
				where: { tournamentId: tournament.id, finalSeed: { not: null } },
				orderBy: { finalSeed: 'asc' },
				select: { id: true, finalSeed: true }
			});

			const scheduledFor = new Date();

			for (let i = 0; i < 16; i++) {
				const leftTeam = seededTeams.find(t => t.finalSeed === i + 1);
				const rightTeam = seededTeams.find(t => t.finalSeed === 32 - i);

				if (!leftTeam && !rightTeam) continue;

				await TournamentManager.generateAndSaveFight(
					dbTournament,
					leftTeam?.id ?? null,
					rightTeam?.id ?? null,
					TournamentPhase.FINALS,
					tournamentStep,
					scheduledFor,
					-1,
					i,
					tournament.id,
					prismaClient
				);
			}
		}

		// -------------------------------------------------------------------------
		// Next Rounds (1/8th, 1/4, 1/2, Final)
		// -------------------------------------------------------------------------
		const previousStep = FINALS_STEP_OFFSET + finalsRound - 1;
		const previousFights = await prismaClient.fightArchive.findMany({
			where: { tournamentId: tournament.id, tournamentStep: previousStep },
			select: { result: true, tournamentTeamLeftId: true, tournamentTeamRightId: true }
		});

		if (previousFights.length === 0) return;

		// Extract the winners in the order of the matches
		const winners = previousFights.map(f => (f.result ? f.tournamentTeamLeftId! : f.tournamentTeamRightId!));

		const scheduledFor = new Date();

		for (let i = 0; i < winners.length; i += 2) {
			const left = winners[i];
			const right = winners[i + 1];
			if (!left || !right) continue;

			await TournamentManager.generateAndSaveFight(
				dbTournament,
				left,
				right,
				TournamentPhase.FINALS,
				tournamentStep,
				scheduledFor,
				-1,
				i / 2,
				tournament.id,
				prismaClient
			);
		}

		if (finalsRound === 4) {
			await TournamentManager.rewardTournament(tournament.id, prismaClient);
		}
	}

	// -------------------------------------------------------------------------
	// Handlers
	// -------------------------------------------------------------------------
	static readonly HANDLERS = {
		[TOURNAMENT_INIT_JOB_KEY]: async () => {
			await TournamentManager.initTournamentJob();
		},
		[TOURNAMENT_POOLS_START_JOB_KEY]: async () => {
			await TournamentManager.poolsStartJob();
		},
		[TOURNAMENT_POOLS_R1_JOB_KEY]: async () => {
			await TournamentManager.poolsRound1Job();
		},
		[TOURNAMENT_POOLS_R2_JOB_KEY]: async () => {
			await TournamentManager.poolsRound2Job();
		},
		[TOURNAMENT_FINALS_R0_JOB_KEY]: async () => {
			await TournamentManager.finalsRoundJob(0);
		},
		[TOURNAMENT_FINALS_R1_JOB_KEY]: async () => {
			await TournamentManager.finalsRoundJob(1);
		},
		[TOURNAMENT_FINALS_R2_JOB_KEY]: async () => {
			await TournamentManager.finalsRoundJob(2);
		},
		[TOURNAMENT_FINALS_R3_JOB_KEY]: async () => {
			await TournamentManager.finalsRoundJob(3);
		},
		[TOURNAMENT_FINALS_R4_JOB_KEY]: async () => {
			await TournamentManager.finalsRoundJob(4);
		}
	};

	// -------------------------------------------------------------------------
	// Pool Logic
	// -------------------------------------------------------------------------

	static async generatePoolBrackets(tournamentId: string, poolsStart: Date, prismaClient = prisma): Promise<void> {
		const alreadyAssigned = await prismaClient.tournamentTeam.count({
			where: { tournamentId, poolNumber: { not: null } }
		});
		if (alreadyAssigned > 0) return;

		const maxTeamsCount = POOL_COUNT * POOL_SIZE;

		const teams = await prismaClient.tournamentTeam.findMany({
			where: { tournamentId },
			select: {
				id: true,
				dojo: {
					select: {
						reputation: true,
						DojoChallengeHistory: {
							select: { victory: true }
						}
					}
				}
			}
		});

		if (teams.length === 0) return;

		const teamsWithScore = teams.map(team => {
			const reputation = team.dojo?.reputation ?? 0;
			const history = team.dojo?.DojoChallengeHistory ?? [];

			const totalMatches = history.length;
			const victoryCount = history.filter(h => h.victory).length;

			const worthRatio = totalMatches > 0 ? victoryCount / totalMatches : 0;
			const worth = Math.trunc(worthRatio * 10000) / 100;

			const score = reputation * worth;

			return {
				id: team.id,
				score
			};
		});

		const sortedTeams = teamsWithScore.sort((a, b) => {
			if (b.score !== a.score) {
				return b.score - a.score;
			}
			return Math.random() - 0.5;
		});

		const selectedTeams = sortedTeams.slice(0, maxTeamsCount);

		const tournament = await prismaClient.tournament.findUniqueOrThrow({
			where: { id: tournamentId },
			select: { poison: true, itemsAllowed: true }
		});
		const shuffled: (string | null)[] = selectedTeams.sort(() => Math.random() - 0.5).map(t => t.id);

		while (shuffled.length < maxTeamsCount) shuffled.push(null);

		const scheduledFor = new Date(poolsStart);

		for (let poolNumber = 0; poolNumber < POOL_COUNT; poolNumber++) {
			const [seedA, seedB, seedC, seedD] = shuffled.slice(
				poolNumber * POOL_SIZE,
				poolNumber * POOL_SIZE + POOL_SIZE
			) as [string | null, string | null, string | null, string | null];

			const realTeams = [seedA, seedB, seedC, seedD].filter((id): id is string => id !== null);
			await Promise.all(
				realTeams.map(id => prismaClient.tournamentTeam.update({ where: { id }, data: { poolNumber } }))
			);

			for (const plan of POOL_MATCH_PLAN.filter(p => p.round === 0)) {
				const leftId = plan.matchNumber === 1 ? seedA : seedC;
				const rightId = plan.matchNumber === 1 ? seedB : seedD;

				await TournamentManager.generateAndSaveFight(
					tournament,
					leftId,
					rightId,
					TournamentPhase.POOLS,
					plan.round,
					scheduledFor,
					poolNumber,
					plan.matchNumber,
					tournamentId,
					prismaClient
				);
				await TournamentManager.applyPoolResult(leftId, rightId, plan, prismaClient);
			}
		}
	}

	/**
	 * Plays the matches of a given pool round (1 or 2) and applies the results.
	 */
	private static async schedulePoolRound(round: number, prismaClient = prisma): Promise<void> {
		const tournament = await TournamentManager.getCurrentTournament(prismaClient);
		if (!tournament || tournament.phase !== TournamentPhase.POOLS) return;

		const dbTournament = await prismaClient.tournament.findUniqueOrThrow({
			where: { id: tournament.id },
			select: { poison: true, itemsAllowed: true }
		});

		const prevRound = round - 1;
		const winners = await TournamentManager.getWinnersFromRound(prevRound, tournament.id, prismaClient);
		const losers = await TournamentManager.getLosersFromRound(prevRound, tournament.id, prismaClient);

		const scheduledFor = new Date();

		for (let poolNumber = 0; poolNumber < POOL_COUNT; poolNumber++) {
			for (const plan of POOL_MATCH_PLAN.filter(p => p.round === round)) {
				const leftTeamId = TournamentManager.resolveDependent(plan.leftFrom!, winners, losers, poolNumber);
				const rightTeamId = TournamentManager.resolveDependent(plan.rightFrom!, winners, losers, poolNumber);

				await TournamentManager.generateAndSaveFight(
					dbTournament,
					leftTeamId,
					rightTeamId,
					TournamentPhase.POOLS,
					round,
					scheduledFor,
					poolNumber,
					plan.matchNumber,
					tournament.id,
					prismaClient
				);
				await TournamentManager.applyPoolResult(leftTeamId, rightTeamId, plan, prismaClient);
			}
		}
	}

	// -------------------------------------------------------------------------
	// Bracket final
	// -------------------------------------------------------------------------

	static async generateFinalBracket(tournamentId: string, prismaClient = prisma): Promise<void> {
		const alreadySeeded = await prismaClient.tournamentTeam.count({
			where: { tournamentId, finalSeed: { not: null } }
		});
		if (alreadySeeded > 0) return;

		const qualified = await prismaClient.tournamentTeam.findMany({
			where: { tournamentId, poolQualified: true },
			select: { id: true, poolWins: true, poolLosses: true }
		});
		if (qualified.length === 0) return;

		const twoZero = qualified.filter(t => t.poolLosses === 0);
		const twoOne = qualified.filter(t => t.poolLosses > 0);

		const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);
		const twoZeroShuffled = shuffle(twoZero);
		const twoOneShuffled = shuffle(twoOne);

		const updates: Promise<any>[] = [];
		twoZeroShuffled.forEach((team, i) => {
			if (i < 16) {
				updates.push(
					prismaClient.tournamentTeam.update({
						where: { id: team.id },
						data: { finalSeed: i + 1 }
					})
				);
			}
		});
		twoOneShuffled.forEach((team, i) => {
			if (i < 16) {
				updates.push(
					prismaClient.tournamentTeam.update({
						where: { id: team.id },
						data: { finalSeed: 32 - i }
					})
				);
			}
		});

		await Promise.all(updates);
	}

	// -------------------------------------------------------------------------
	// Helpers propagation
	// -------------------------------------------------------------------------

	static async getWinnersFromRound(
		round: number,
		tournamentId: string,
		prismaClient = prisma
	): Promise<RawTournamentMatch[]> {
		const fights = await prismaClient.fightArchive.findMany({
			where: { tournamentId, tournamentStep: round },
			select: { tournamentTeamLeftId: true, tournamentTeamRightId: true, result: true, metadata: true }
		});
		return fights
			.filter(f => f.metadata)
			.map(f => {
				const meta = JSON.parse(f.metadata as string) as MetaData;
				return {
					team: f.result ? f.tournamentTeamLeftId : f.tournamentTeamRightId,
					poolNumber: meta.poolNumber,
					matchNumber: meta.matchNumber
				};
			});
	}

	static async getLosersFromRound(
		round: number,
		tournamentId: string,
		prismaClient = prisma
	): Promise<RawTournamentMatch[]> {
		const fights = await prismaClient.fightArchive.findMany({
			where: { tournamentId, tournamentStep: round },
			select: { tournamentTeamLeftId: true, tournamentTeamRightId: true, result: true, metadata: true }
		});
		return fights
			.filter(f => f.metadata)
			.map(f => {
				const meta = JSON.parse(f.metadata as string) as MetaData;
				return {
					team: f.result ? f.tournamentTeamRightId : f.tournamentTeamLeftId,
					poolNumber: meta.poolNumber,
					matchNumber: meta.matchNumber
				};
			});
	}

	private static resolveDependent(
		dep: MatchDep,
		winners: RawTournamentMatch[],
		losers: RawTournamentMatch[],
		poolNumber: number
	): string | null {
		const source = dep.result === 'winner' ? winners : losers;
		return source.find(m => m.poolNumber === poolNumber && m.matchNumber === dep.matchNumber)?.team ?? null;
	}

	// -------------------------------------------------------------------------
	// Pool record updates
	// -------------------------------------------------------------------------

	static async applyPoolResult(
		leftTeamId: string | null,
		rightTeamId: string | null,
		plan: PoolMatchPlan,
		prismaClient = prisma
	): Promise<void> {
		if (!leftTeamId || !rightTeamId) {
			const realTeamId = leftTeamId ?? rightTeamId;
			if (!realTeamId) return;
			const team = await prismaClient.tournamentTeam.update({
				where: { id: realTeamId },
				data: { poolWins: { increment: 1 } }
			});
			if (team.poolWins >= POOL_WIN_COUNT) {
				await prismaClient.tournamentTeam.update({ where: { id: realTeamId }, data: { poolQualified: true } });
			}
			return;
		}

		const fight = await prismaClient.fightArchive.findFirst({
			where: { tournamentTeamLeftId: leftTeamId, tournamentTeamRightId: rightTeamId },
			orderBy: { tournamentStep: 'desc' },
			select: { result: true }
		});
		if (!fight) return;

		const winnerId = fight.result ? leftTeamId : rightTeamId;
		const loserId = fight.result ? rightTeamId : leftTeamId;

		const [winner, loser] = await Promise.all([
			prismaClient.tournamentTeam.update({ where: { id: winnerId }, data: { poolWins: { increment: 1 } } }),
			prismaClient.tournamentTeam.update({ where: { id: loserId }, data: { poolLosses: { increment: 1 } } })
		]);

		await Promise.all(
			[
				winner.poolWins >= POOL_WIN_COUNT &&
					prismaClient.tournamentTeam.update({ where: { id: winnerId }, data: { poolQualified: true } }),
				loser.poolLosses >= POOL_LOSS_COUNT &&
					prismaClient.tournamentTeam.update({ where: { id: loserId }, data: { poolEliminated: true } })
			].filter(Boolean) as Promise<any>[]
		);
	}

	// -------------------------------------------------------------------------
	// Fight creation
	// -------------------------------------------------------------------------

	private static async generateAndSaveFight(
		tournamentRules: { poison: boolean; itemsAllowed: boolean },
		team1Id: string | null,
		team2Id: string | null,
		phase: TournamentPhase,
		round: number,
		scheduledFor: Date,
		poolNumber: number,
		matchNumber: number,
		tournamentId: string,
		prismaClient = prisma
	): Promise<boolean> {
		const isBye = !team1Id || !team2Id;
		const leftWonBye = !team1Id ? false : true;

		const getDinozIds = async (teamId: string) => {
			const team = await prismaClient.tournamentTeam.findUniqueOrThrow({
				where: { id: teamId },
				select: { dinoz: { select: { id: true } } }
			});
			return team.dinoz.map(d => d.id);
		};

		let team1Dinoz = team1Id ? await getDinozForDojoFight(await getDinozIds(team1Id)) : [];
		let team2Dinoz = team2Id ? await getDinozForDojoFight(await getDinozIds(team2Id)) : [];

		if (isBye) {
			const metadata: MetaData = {
				phase,
				round,
				poolNumber,
				matchNumber,
				scheduledFor: scheduledFor.toISOString(),
				team1Id,
				team2Id,
				place: PlaceEnum.DOJO
			};
			const fighters = [
				...team1Dinoz.map(d => ({
					id: d.id,
					type: 'dinoz',
					name: d.name,
					display: d.display,
					attacker: true,
					maxHp: d.maxLife,
					startingHp: d.life,
					energy: 0,
					maxEnergy: 0,
					energyRecovery: 0,
					dark: false,
					size: 100,
					entrance: 0
				})),
				...team2Dinoz.map(d => ({
					id: d.id,
					type: 'dinoz',
					name: d.name,
					display: d.display,
					attacker: false,
					maxHp: d.maxLife,
					startingHp: d.life,
					energy: 0,
					maxEnergy: 0,
					energyRecovery: 0,
					dark: false,
					size: 100,
					entrance: 0
				}))
			];
			await prismaClient.fightArchive.create({
				data: {
					fighters: JSON.stringify(fighters),
					steps: '[]',
					seed: 'bye',
					result: leftWonBye,
					tournamentStep: round,
					Tournament: { connect: { id: tournamentId } },
					metadata: JSON.stringify(metadata),
					tournamentTeamLeft: team1Id ? { connect: { id: team1Id } } : undefined,
					tournamentTeamRight: team2Id ? { connect: { id: team2Id } } : undefined,
					leftUser:
						team1Dinoz.length > 0 && team1Dinoz[0].userId ? { connect: { id: team1Dinoz[0].userId } } : undefined,
					rightUser:
						team2Dinoz.length > 0 && team2Dinoz[0].userId ? { connect: { id: team2Dinoz[0].userId } } : undefined
				}
			});
			return leftWonBye;
		}

		const prepDinoz = (dinoz: typeof team1Dinoz) => {
			dinoz.forEach(d => {
				if (tournamentRules.itemsAllowed) {
					d.items = d.items.filter(i => Object.values(itemList).find(item => item.itemId === i.itemId));
				} else {
					d.items = [];
				}
				d.life = d.maxLife;
				d.skills = d.skills.filter(
					s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
				);
			});
		};
		prepDinoz(team1Dinoz);
		prepDinoz(team2Dinoz);

		const rules: FightRules = {
			...TOURNAMENT_RULES,
			poisonEnabled: tournamentRules.poison,
			canUseEquipment: tournamentRules.itemsAllowed
		};
		let fight = calculateFightBetweenPlayers(rules, team1Dinoz, false, team2Dinoz, false, PlaceEnum.DOJO);

		const computeWinner = () => {
			const left = fight.stats.attack.endingHp * fight.stats.defense.startingHp;
			const right = fight.stats.defense.endingHp * fight.stats.attack.startingHp;
			return fight.outcome === FightOutcome.AttackerWin || (fight.outcome === FightOutcome.Timeout && left > right);
		};

		let leftWon = computeWinner();
		let retryCounter = 0;
		while (fight.outcome === FightOutcome.Tie && retryCounter < 5) {
			fight = calculateFightBetweenPlayers(rules, team1Dinoz, false, team2Dinoz, false, PlaceEnum.DOJO);
			leftWon = computeWinner();
			retryCounter++;
		}

		const metadata: MetaData = {
			phase,
			round,
			poolNumber,
			matchNumber,
			scheduledFor: scheduledFor.toISOString(),
			team1Id,
			team2Id,
			place: PlaceEnum.DOJO
		};

		await prismaClient.fightArchive.create({
			data: {
				fighters: JSON.stringify(
					fight.fighters.map(f => ({
						id: f.id,
						type: f.type,
						name: f.name,
						display: f.display,
						attacker: f.attacker,
						maxHp: f.maxHp,
						startingHp: f.startingHp,
						energy: f.energy,
						maxEnergy: f.maxEnergy,
						energyRecovery: f.energyRecovery,
						dark: f.dark,
						size: f.size,
						entrance: f.entrance
					}))
				),
				steps: fight.steps ? JSON.stringify(fight.steps) : '[]',
				seed: fight.seed,
				result: fight.outcome === FightOutcome.AttackerWin,
				tournamentStep: round,
				Tournament: { connect: { id: tournamentId } },
				metadata: JSON.stringify(metadata),
				tournamentTeamLeft: team1Id ? { connect: { id: team1Id } } : undefined,
				tournamentTeamRight: team2Id ? { connect: { id: team2Id } } : undefined,
				leftUser: team1Dinoz.length > 0 && team1Dinoz[0].userId ? { connect: { id: team1Dinoz[0].userId } } : undefined,
				rightUser: team2Dinoz.length > 0 && team2Dinoz[0].userId ? { connect: { id: team2Dinoz[0].userId } } : undefined
			}
		});

		return leftWon;
	}

	// -------------------------------------------------------------------------
	// Rewards distribution
	// -------------------------------------------------------------------------

	private static async getFinalsEliminationRanking(
		tournamentId: string,
		prismaClient = prisma
	): Promise<{ teamId: string; dojoId: string | null }[]> {
		const finalStep = FINALS_STEP_OFFSET + 4;

		const finalsFights = await prismaClient.fightArchive.findMany({
			where: { tournamentId, tournamentStep: { gte: FINALS_STEP_OFFSET } },
			select: {
				tournamentStep: true,
				result: true,
				metadata: true,
				tournamentTeamLeftId: true,
				tournamentTeamRightId: true,
				tournamentTeamLeft: { select: { dojoId: true } },
				tournamentTeamRight: { select: { dojoId: true } }
			}
		});

		const byStep = new Map<number, typeof finalsFights>();
		for (const f of finalsFights) {
			const arr = byStep.get(f.tournamentStep) ?? [];
			arr.push(f);
			byStep.set(f.tournamentStep, arr);
		}

		const ranking: { teamId: string; dojoId: string | null }[] = [];

		const finalFight = byStep.get(finalStep)?.[0];
		if (finalFight) {
			const winnerId = finalFight.result ? finalFight.tournamentTeamLeftId : finalFight.tournamentTeamRightId;
			const loserId = finalFight.result ? finalFight.tournamentTeamRightId : finalFight.tournamentTeamLeftId;
			const winnerDojo = finalFight.result
				? finalFight.tournamentTeamLeft?.dojoId
				: finalFight.tournamentTeamRight?.dojoId;
			const loserDojo = finalFight.result
				? finalFight.tournamentTeamRight?.dojoId
				: finalFight.tournamentTeamLeft?.dojoId;
			if (winnerId) ranking.push({ teamId: winnerId, dojoId: winnerDojo ?? null });
			if (loserId) ranking.push({ teamId: loserId, dojoId: loserDojo ?? null });
		}

		for (let step = finalStep - 1; step >= FINALS_STEP_OFFSET; step--) {
			const fights = (byStep.get(step) ?? []).slice().sort((a, b) => {
				const ma = (JSON.parse(a.metadata ?? '{}') as MetaData).matchNumber ?? 0;
				const mb = (JSON.parse(b.metadata ?? '{}') as MetaData).matchNumber ?? 0;
				return ma - mb;
			});
			for (const f of fights) {
				const loserId = f.result ? f.tournamentTeamRightId : f.tournamentTeamLeftId;
				const loserDojo = f.result ? f.tournamentTeamRight?.dojoId : f.tournamentTeamLeft?.dojoId;
				if (loserId) ranking.push({ teamId: loserId, dojoId: loserDojo ?? null });
			}
		}

		return ranking;
	}

	private static async getPoolEliminatedTeams(
		tournamentStep: number,
		matchNumber: number,
		tournamentId: string,
		prismaClient = prisma
	): Promise<{ teamId: string; dojoId: string | null }[]> {
		const fights = await prismaClient.fightArchive.findMany({
			where: { tournamentId, tournamentStep },
			select: {
				result: true,
				metadata: true,
				tournamentTeamLeftId: true,
				tournamentTeamRightId: true,
				tournamentTeamLeft: { select: { dojoId: true } },
				tournamentTeamRight: { select: { dojoId: true } }
			}
		});

		return fights
			.map(f => ({ ...f, meta: JSON.parse(f.metadata ?? '{}') as MetaData }))
			.filter(f => f.meta.matchNumber === matchNumber)
			.sort((a, b) => (a.meta.poolNumber ?? 0) - (b.meta.poolNumber ?? 0))
			.map(f => {
				const loserId = f.result ? f.tournamentTeamRightId : f.tournamentTeamLeftId;
				const loserDojo = f.result ? f.tournamentTeamRight?.dojoId : f.tournamentTeamLeft?.dojoId;
				return { teamId: loserId, dojoId: loserDojo ?? null };
			})
			.filter((t): t is { teamId: string; dojoId: string | null } => !!t.teamId);
	}

	private static async rewardQualification() {
		const rankings = await prisma.ranking.findMany({
			where: {
				dojo: {
					gt: 500
				}
			},
			select: {
				dojo: true,
				user: {
					select: {
						id: true,
						name: true
					}
				}
			}
		});

		for (const rank of rankings) {
			if (!rank.user?.id) continue;

			const userId = rank.user.id;
			const score = rank.dojo;

			const promises: Promise<unknown>[] = [];
			const notifRewards: Array<{ rewardType: RewardEnum; value: unknown; quantity?: number }> = [];

			let totalGold = 0;

			if (score >= 500) {
				totalGold += 25000;
				promises.push(addItemToInventory(userId, Item.BOX_EPIC, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.BOX_EPIC, quantity: 1 });
			}
			if (score >= 750) {
				totalGold += 50000;
				promises.push(addItemToInventory(userId, Item.VOID_SPHERE, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.VOID_SPHERE, quantity: 1 });
			}
			if (score >= 1000) {
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY, quantity: 1 });
			}
			if (score >= 1200) {
				totalGold += 75000;
				promises.push(addItemToInventory(userId, Item.BOX_LEGENDARY, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.BOX_LEGENDARY, quantity: 1 });
			}
			if (score >= 1300) {
				promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY_RARE, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY_RARE, quantity: 1 });
			}
			if (score >= 1400) {
				totalGold += 150000;
				promises.push(addItemToInventory(userId, Item.GOLDEN_NAPODINO, 1));
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY_RARE, 1));
				promises.push(addItemToInventory(userId, Item.BOX_LEGENDARY, 1));
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.GOLDEN_NAPODINO, quantity: 1 });
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY_RARE, quantity: 1 });
				notifRewards.push({ rewardType: RewardEnum.ITEM, value: Item.BOX_LEGENDARY, quantity: 1 });
			}
			promises.push(addMoney(userId, totalGold));
			notifRewards.unshift({ rewardType: RewardEnum.GOLD, value: totalGold });

			promises.push(newNotif(userId, NotificationType.NEW_REWARD, JSON.stringify(notifRewards)));

			await Promise.all(promises);
		}
	}

	private static async rewardTournament(tournamentId: string, prismaClient = prisma) {
		const tournament = await prismaClient.tournament.findUniqueOrThrow({
			where: { id: tournamentId },
			select: { cashPrice: true }
		});

		// Rangs 1-32 : classement de la phase finale
		const finalsRanking = await TournamentManager.getFinalsEliminationRanking(tournamentId, prismaClient);
		// Rangs 33-48 : perdants 1-2 (M5, round pool 2)
		const oneTwoLosers = await TournamentManager.getPoolEliminatedTeams(2, 5, tournamentId, prismaClient);
		// Rangs 49-64 : perdants 0-2 (M4, round pool 1)
		const zeroTwoLosers = await TournamentManager.getPoolEliminatedTeams(1, 4, tournamentId, prismaClient);

		const fullRanking = [...finalsRanking, ...oneTwoLosers, ...zeroTwoLosers];

		const users: string[] = [];
		for (const entry of fullRanking) {
			if (!entry.dojoId) continue;
			const user = await prismaClient.dojo.findUnique({
				where: { id: entry.dojoId },
				select: { userId: true }
			});
			if (user) users.push(user.userId);
		}

		let index = 1;
		const promises: Promise<unknown>[] = [];
		for (const userId of users) {
			if (index === 1) {
				await prismaClient.userRewards.create({
					data: { userId: userId, rewardId: Reward.TID1 }
				});
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY_RARE, 1));
				promises.push(addItemToInventory(userId, Item.BOX_LEGENDARY, 1));
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.15)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([
							{ rewardType: RewardEnum.EPIC, value: Reward.TID1 },
							{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.15) },
							{ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY_RARE, quantity: 1 },
							{ rewardType: RewardEnum.ITEM, value: Item.BOX_LEGENDARY, quantity: 1 }
						])
					)
				);
			} else if (index === 2) {
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY, 1));
				promises.push(addItemToInventory(userId, Item.BOX_LEGENDARY, 1));
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.1)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([
							{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.1) },
							{ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY, quantity: 1 },
							{ rewardType: RewardEnum.ITEM, value: Item.BOX_LEGENDARY, quantity: 1 }
						])
					)
				);
			} else if (index <= 4) {
				promises.push(addItemToInventory(userId, Item.TOUFUFU_BABY, 1));
				promises.push(addItemToInventory(userId, Item.BOX_EPIC, 1));
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.075)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([
							{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.075) },
							{ rewardType: RewardEnum.ITEM, value: Item.TOUFUFU_BABY, quantity: 1 },
							{ rewardType: RewardEnum.ITEM, value: Item.BOX_EPIC, quantity: 1 }
						])
					)
				);
			} else if (index <= 8) {
				promises.push(addItemToInventory(userId, Item.BOX_RARE, 1));
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.04)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([
							{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.04) },
							{ rewardType: RewardEnum.ITEM, value: Item.BOX_RARE, quantity: 1 }
						])
					)
				);
			} else if (index <= 16) {
				promises.push(addItemToInventory(userId, Item.BOX_RARE, 1));
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.02)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([
							{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.02) },
							{ rewardType: RewardEnum.ITEM, value: Item.BOX_RARE, quantity: 1 }
						])
					)
				);
			} else if (index <= 32) {
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.01)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.01) }])
					)
				);
			} else if (index <= 48) {
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.0075)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.0075) }])
					)
				);
			} else {
				promises.push(addMoney(userId, Math.floor(tournament.cashPrice * 0.00625)));
				promises.push(
					newNotif(
						userId,
						NotificationType.NEW_REWARD,
						JSON.stringify([{ rewardType: RewardEnum.GOLD, value: Math.floor(tournament.cashPrice * 0.00625) }])
					)
				);
			}
			index++;
		}

		await Promise.all(promises);
	}
}

export default TournamentManager;
