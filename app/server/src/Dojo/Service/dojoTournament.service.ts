import { PublicMetada, PublicTournament, TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import TournamentManager from '../../utils/tournamentManager.js';
import { getPlayerDinozInformationForTeam } from '../Controller/dojoChallenge.controller.js';
import { createMyTeamSchema, dojoTournamentRequestSchema } from '../Schema/dojo.schema.js';

export async function getLatestTournament() {
	return await prisma.tournament.findFirst({
		orderBy: {
			date: 'desc'
		},
		select: {
			id: true,
			date: true,
			raceMinimum: true,
			teamRace: true,
			teamSize: true,
			levelLimit: true
		}
	});
}

export async function createTournamentTeam(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = createMyTeamSchema.parse(req.body);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError('qualification over');
	}

	const teamIds = body.team;

	const latestTournament = await getLatestTournament();

	// This shouldn't happen
	if (!latestTournament) {
		throw new Error('No tournament found.');
	}

	// Check if player select the right number of dinoz
	if (teamIds.length !== latestTournament.teamSize) {
		throw new ExpectedError('wrong number of dinoz');
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(userId);

	// The player must have visited the dojo at least once
	if (!playerDinoz.dojo) {
		throw new ExpectedError('dojo not found');
	}

	// Check if player already has a registered team
	if (playerDinoz.dojo.tournamentTeamId) {
		throw new ExpectedError('team already registered');
	}

	// Check if player possess all the selected dinoz
	if (!teamIds.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError('selected dinoz not found');
	}

	const playerFilteredDinoz = playerDinoz.dinoz.filter(d => teamIds.includes(d.id));

	const authorizedRaces = latestTournament.teamRace.split(',').map(r => parseInt(r)) as number[];

	// Check if dinoz races are authorized for this tournament
	if (!playerFilteredDinoz.every(d => authorizedRaces.includes(d.raceId))) {
		throw new ExpectedError('wrong race selected');
	}

	//Check if dinoz are under max level
	if (playerFilteredDinoz.some(d => d.level > latestTournament.levelLimit)) {
		throw new ExpectedError('dinoz too high level');
	}

	// Check filtered dinoz is equal to asked dinoz (shouldn't be possible)
	if (playerFilteredDinoz.length !== teamIds.length) {
		throw new ExpectedError('Filtered dinoz is not enought');
	}

	// Check if number of race is at least equal to the limit
	const playerRaces = new Set<number>();
	playerFilteredDinoz.forEach(d => playerRaces.add(d.raceId));
	if (playerRaces.size < latestTournament.raceMinimum) {
		throw new ExpectedError('not enough diversity');
	}

	await prisma.tournamentTeam.create({
		data: {
			dinoz: {
				connect: teamIds.map(id => ({ id: id }))
			},
			Tournament: {
				connect: { id: latestTournament.id }
			},
			dojo: {
				connect: { id: playerDinoz.dojo.id }
			},
			dojoId: playerDinoz.dojo.id,
			teamCount: teamIds.length
		},
		include: {
			dinoz: true
		}
	});
}

export async function deleteTournamentTeam(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError('qualification over');
	}

	const myTeam = await prisma.dojo.findUnique({
		where: {
			userId
		},
		select: {
			tournamentTeamId: true
		}
	});

	if (!myTeam || !myTeam.tournamentTeamId) {
		throw new ExpectedError('Team inexistant');
	}

	await prisma.tournamentTeam.delete({
		where: {
			id: myTeam.tournamentTeamId
		}
	});
}

export async function getTournamentInfo(req: FastifyRequest, reply: FastifyReply) {
	const latestTournament = await getLatestTournament();

	if (!latestTournament) {
		return reply.send(undefined);
	}

	return reply.send({
		...latestTournament,
		teamRace: latestTournament.teamRace.split(',').map(d => parseInt(d))
	});
}

export async function getTournamentTeam(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const myTeam = await prisma.dojo.findUnique({
		where: { userId },
		select: {
			TournamentTeam: {
				select: {
					dinoz: {
						select: {
							id: true,
							name: true,
							display: true,
							level: true
						}
					}
				}
			}
		}
	});

	if (!myTeam || !myTeam.TournamentTeam) {
		return reply.send([]);
	}

	return reply.send(myTeam.TournamentTeam.dinoz);
}

export async function getViewedTournamentFight(userId: string, tournamentFights: string[]) {
	return await prisma.fightWatched.findMany({
		where: {
			AND: [
				{
					fightArchiveId: {
						in: tournamentFights
					}
				},
				{ userId: userId }
			]
		}
	});
}

export async function getTournamentFightsToShow(
	fights: Exclude<PublicTournament, 'watched'>[],
	userId: string,
	phase: TournamentPhase,
	pool: number
): Promise<PublicTournament[]> {
	const targetFights = fights
		.filter(t => t.metadata.phase === phase)
		.filter(t => phase === TournamentPhase.FINALS || t.metadata.poolNumber === pool);
	const watchedFightIds = (
		await getViewedTournamentFight(
			userId,
			targetFights.map(f => f.id)
		)
	).map(f => f.fightArchiveId);

	// Fights against byes will be considered automatically watched
	const nonWatchedFights = targetFights.filter(
		f => f.tournamentTeamLeft && f.tournamentTeamRight && !watchedFightIds.includes(f.id)
	);

	const mostAdvancedStep =
		nonWatchedFights.length > 0 ? Math.min(...nonWatchedFights.map(f => f.metadata.round)) : null;

	return targetFights
		.filter(t => {
			return mostAdvancedStep === null || t.metadata.round <= mostAdvancedStep;
		})
		.map(fight => {
			return {
				...fight,
				watched: !nonWatchedFights.map(f => f.id).includes(fight.id)
			};
		});
}

export async function getDojoTournamentFights(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = dojoTournamentRequestSchema.parse(req.params);

	const fights = await prisma.fightArchive.findMany({
		where: {
			tournamentId: body.id
		},
		select: {
			id: true,
			tournamentTeamLeftId: true,
			tournamentTeamRightId: true,
			leftUser: {
				select: {
					id: true,
					name: true
				}
			},
			rightUser: {
				select: {
					id: true,
					name: true
				}
			},
			fighters: true,
			metadata: true,
			result: true
		}
	});
	if (body.phase === TournamentPhase.FINALS) {
		body.pool = -1;
	}

	const transformedFights = fights.map(f => {
		const fighters = JSON.parse(f.fighters) as FighterRecap[]; // fighters are preserved after player deletion
		fighters.sort((a, b) => a.id - b.id);
		return {
			id: f.id,
			tournamentTeamLeft: f.tournamentTeamLeftId
				? {
						dinoz: fighters.filter(fighter => fighter.type === 'dinoz').filter(fighter => fighter.attacker)[0],
						user: f.leftUser
					}
				: null,
			tournamentTeamRight: f.tournamentTeamRightId
				? {
						dinoz: fighters.filter(fighter => fighter.type === 'dinoz').filter(fighter => !fighter.attacker)[0],
						user: f.rightUser
					}
				: null,
			metadata: JSON.parse(<string>f.metadata) as PublicMetada,
			result: f.result
		};
	}) as PublicTournament[];

	return reply.send(await getTournamentFightsToShow(transformedFights, userId, body.phase, body.pool));
}

export async function viewFight(userId: string, fightArchiveId: string) {
	await prisma.fightWatched.upsert({
		where: {
			userId_fightArchiveId: { userId, fightArchiveId }
		},
		create: {
			userId,
			fightArchiveId,
			favorite: false
		},
		update: {
			// Do nothing
		}
	});
}

export async function readAllFightFromPool(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = dojoTournamentRequestSchema.parse(req.params);
	const fights = await prisma.fightArchive.findMany({
		where: {
			tournamentId: body.id
		},
		select: {
			id: true,
			tournamentTeamLeft: {
				select: {
					dinoz: {
						take: 1,
						select: {
							id: true,
							display: true,
							name: true,
							user: {
								select: {
									id: true,
									name: true
								}
							}
						}
					}
				}
			},
			tournamentTeamRight: {
				select: {
					dinoz: {
						take: 1,
						select: {
							id: true,
							display: true,
							name: true,
							user: {
								select: {
									id: true,
									name: true
								}
							}
						}
					}
				}
			},
			metadata: true,
			result: true
		}
	});

	const poolFights = fights
		.map(f => {
			return {
				id: f.id,
				tournamentTeamLeft: f.tournamentTeamLeft?.dinoz[0],
				tournamentTeamRight: f.tournamentTeamRight?.dinoz[0],
				metadata: JSON.parse(<string>f.metadata) as PublicMetada,
				result: f.result
			};
		})
		.filter(t => t.metadata.phase === body.phase)
		.filter(t => body.phase === TournamentPhase.FINALS || t.metadata.poolNumber === body.pool)
		.map(f => f.id);

	for (const poolFight of poolFights) {
		await viewFight(userId, poolFight);
	}
}

export async function getPoolStandings(req: FastifyRequest, reply: FastifyReply) {
	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	if (!tournament) throw new ExpectedError('tournament not found');

	const teams = await prisma.tournamentTeam.findMany({
		where: { tournamentId: tournament.id, poolNumber: { not: null } },
		select: {
			id: true,
			dojoId: true,
			poolNumber: true,
			poolWins: true,
			poolLosses: true,
			poolQualified: true,
			poolEliminated: true,
			finalSeed: true
		},
		orderBy: [{ poolNumber: 'asc' }, { poolWins: 'desc' }, { poolLosses: 'asc' }]
	});

	return reply.send(teams);
}
