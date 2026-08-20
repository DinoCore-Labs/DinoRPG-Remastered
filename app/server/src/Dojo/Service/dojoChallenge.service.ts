import { Challenge, parseChallenge } from '@dinorpg/core/models/dojo/challenge.js';
import {
	DOJO_FIGHT_COST,
	DOJO_MAX_DAILY_CHALLENGE,
	DOJO_MAX_SERIES,
	DOJO_OPPONENT_IN_SERIE,
	DOJO_REPUTATION_CHALLENGE,
	DOJO_REPUTATION_WIN
} from '@dinorpg/core/models/dojo/constants.js';
import { TournamentPhase } from '@dinorpg/core/models/dojo/tournament.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FightOutcome } from '@dinorpg/core/models/fight/fightResult.js';
import { Skill } from '@dinorpg/core/models/skills/skillList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { calculateFightBetweenPlayers } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { addTreasureTicket, removeMoney } from '../../User/Controller/money.controller.js';
import { DOJO_CHALLENGE_RULES } from '../../utils/fight/fight.mapper.js';
import { TournamentManager } from '../../utils/tournamentManager.js';
import { getDojo } from '../Controller/dojo.controller.js';
import {
	cleanCurrentOpponentTeam,
	createOpponentTeam,
	generateRandomChallenge,
	getChallengeTeam,
	getDojoChallengePreparationRequest,
	getDojoDataForRanking,
	getPlayerDinozInformationForTeam,
	incrementDailyReset,
	pickOpponentIds,
	replaceMyTeam
} from '../Controller/dojoChallenge.controller.js';
import { challengeFightSchema, createMyTeamSchema, skipOpponentSchema } from '../Schema/dojo.schema.js';
import { archiveFight, getDinozForDojoFight } from './dojoTest.service.js';

export async function skipOpponent(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = skipOpponentSchema.parse(req.body);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError('qualification over');
	}

	const user = await getDojoChallengePreparationRequest(userId);

	if (!user.dojo) {
		throw new ExpectedError('dojo not found');
	}

	const myDojo = user.dojo;
	const opponent = myDojo.DojoOpponents.find(d => d.dinozId === body.dinozId);
	if (!opponent) {
		throw new ExpectedError('opponent not found');
	}

	if (!opponent.fighted) {
		throw new ExpectedError('opponent not fighted');
	}

	if (opponent.achieved) {
		throw new ExpectedError('opponent already defeated');
	}

	const ranking = await getDojoDataForRanking(userId);
	const victory = ranking.DojoChallengeHistory.filter(h => h.victory).length;
	const worth = victory / (ranking.DojoChallengeHistory.length + 1);

	await prisma.$transaction(async tx => {
		removeMoney(userId, DOJO_FIGHT_COST);

		await tx.tournament.update({
			where: { id: tournament.id },
			data: { cashPrice: { increment: DOJO_FIGHT_COST } }
		});
		await tx.dojoOpponents.update({
			where: {
				dojoId_dinozId: {
					dinozId: body.dinozId,
					dojoId: myDojo.id
				}
			},
			data: {
				fighted: true,
				achieved: true
			}
		});
		await tx.dojoChallengeHistory.create({
			data: {
				myDinozId: 0, // A skip involves none of the player's dinoz
				opponentId: body.dinozId,
				challenge: JSON.stringify(myDojo.activeChallenge),
				victory: false,
				achieved: false,
				dojo: { connect: { id: myDojo.id } }
			}
		});
		await tx.ranking.update({
			where: { userId: userId },
			data: { dojo: Math.round(worth * ranking.reputation) }
		});
	});

	// If skip generate new batch of opponent
	if (myDojo.DojoOpponents.filter(d => d.achieved).length + 1 === DOJO_OPPONENT_IN_SERIE) {
		await addTreasureTicket(userId, 1);

		await incrementDailyReset(myDojo.id);
	}
}

export async function fightChallenge(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = challengeFightSchema.parse(req.body);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError('qualification over');
	}

	const user = await getDojoChallengePreparationRequest(userId);

	if (!user.dojo) {
		throw new ExpectedError('dojo not found');
	}

	const myDinoz = user.dojo.team.find(d => d.dinozId === body.myDinozId);
	const opponent = user.dojo.DojoOpponents.find(d => d.dinozId === body.opponentId);
	if (!myDinoz || !opponent) {
		throw new ExpectedError('dinoz not found');
	}

	if (myDinoz.fighted || opponent.achieved) {
		throw new ExpectedError('dinoz already fighted');
	}

	const leftTeam = await getDinozForDojoFight([body.myDinozId]);
	const rightTeam = await getDinozForDojoFight([body.opponentId]);

	// Remove items from dinoz for the fight and set life to maxLife
	rightTeam.map(d => {
		d.items = [];
		d.life = d.maxLife;
		// Remove Trou noir, Sylphides and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});
	leftTeam.map(d => {
		d.items = [];
		d.life = d.maxLife;
		// Remove Trou noir, Sylphides and Hypnose
		d.skills = d.skills.filter(
			s => s.skillId !== Skill.TROU_NOIR && s.skillId !== Skill.HYPNOSE && s.skillId !== Skill.SYLPHIDES
		);
	});

	const fightResult = calculateFightBetweenPlayers(
		DOJO_CHALLENGE_RULES,
		leftTeam,
		false,
		rightTeam,
		false,
		PlaceEnum.DOJO,
		100
	);

	let victory = false;

	// Only defeating the opponent or having more % hp left on timeout give a victory. Defeat, having less % hp on timeout and tie give a defeat.

	// The winner and loser will be calculated based on the remaining hp (%) in case of timeout
	// That is, the loser will be the one with lowest endingHp / startingHp
	// To avoid comparing non-integer numbers, instead of comparing
	// "attack.endingHp / attack.startingHp" with "defense.endingHp / defense.startingHp"
	// Compare: "attack.endingHp * defense.startingHp' with "defense.endingHp * attack.startingHp"
	const left = fightResult.stats.attack.endingHp * fightResult.stats.defense.startingHp;
	const right = fightResult.stats.defense.endingHp * fightResult.stats.attack.startingHp;
	if (
		fightResult.outcome === FightOutcome.AttackerWin ||
		(fightResult.outcome === FightOutcome.Timeout && left > right)
	) {
		victory = true;
	}

	const fightArchive = await archiveFight(
		fightResult,
		victory,
		userId,
		rightTeam.length > 0 ? rightTeam[0].userId : null,
		JSON.stringify({ placeId: PlaceEnum.DOJO })
	);

	const activeChallenge = user.dojo.activeChallenge as Challenge;
	const challengeWon = parseChallenge(activeChallenge, fightResult.stats) <= 0 && victory;

	const newChallenge = generateRandomChallenge();
	await prisma.$transaction(async tx => {
		const dojo = await tx.dojo.findUniqueOrThrow({
			where: { userId },
			include: { DojoChallengeHistory: true }
		});

		// Atomic charge: fails if the money dropped below the cost since the initial check
		removeMoney(userId, DOJO_FIGHT_COST);

		await tx.tournament.update({
			where: {
				id: tournament.id
			},
			data: {
				cashPrice: {
					increment: DOJO_FIGHT_COST
				}
			}
		});
		await tx.dojoTeam.update({
			where: {
				dojoId_dinozId: {
					dojoId: dojo.id,
					dinozId: body.myDinozId
				}
			},
			data: {
				fighted: true
			}
		});
		await tx.dojoOpponents.update({
			where: {
				dojoId_dinozId: {
					dinozId: body.opponentId,
					dojoId: dojo.id
				}
			},
			data: {
				fighted: true,
				achieved: fightArchive.result
			}
		});

		const addedReputation = victory ? DOJO_REPUTATION_WIN + (challengeWon ? DOJO_REPUTATION_CHALLENGE : 0) : 0;
		const newReputation = dojo.reputation + addedReputation;
		const totalCombats = dojo.DojoChallengeHistory.length + 1;
		const totalVictoires = dojo.DojoChallengeHistory.filter(h => h.victory).length + (victory ? 1 : 0);
		const worth = totalVictoires / totalCombats;
		const newDojoPoints = Math.round(worth * newReputation);

		await tx.dojo.update({
			where: { id: dojo.id },
			data: {
				reputation: { increment: addedReputation },
				activeChallenge: newChallenge,
				DojoChallengeHistory: {
					create: {
						myDinozId: body.myDinozId,
						opponentId: body.opponentId,
						challenge: JSON.stringify(activeChallenge),
						victory: fightArchive.result,
						achieved: challengeWon
					}
				}
			}
		});
		await tx.ranking.update({
			where: { userId },
			data: { dojo: newDojoPoints }
		});
	});

	// TODO

	// Grant the rewards only once the fight has been paid and recorded
	const promises = [];

	//TODO

	if (fightArchive.result && user.dojo.DojoOpponents.filter(o => o.achieved).length + 1 === DOJO_OPPONENT_IN_SERIE) {
		promises.push(addTreasureTicket(userId, 1));
		promises.push(incrementDailyReset(user.dojo.id));
	}

	if (challengeWon && user.dojo.DojoChallengeHistory.filter(c => c.achieved).length < DOJO_MAX_DAILY_CHALLENGE) {
		promises.push(addTreasureTicket(userId, 1));
	}

	await Promise.all(promises);

	return reply.send({ fight: fightArchive, stats: fightResult.stats, challengeWon: challengeWon, victory });
}

export async function createMyTeam(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = createMyTeamSchema.parse(req.body);

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);

	if (!tournament || tournament.phase !== TournamentPhase.QUALIFICATION) {
		throw new ExpectedError('qualification over');
	}

	let myDojo = await getDojo(userId);

	if (!myDojo) {
		throw new ExpectedError('dojo not found');
	}

	if (body.team.length < 5 || body.team.length > 10) {
		throw new ExpectedError('wrong number of dinoz in team');
	}

	const playerDinoz = await getPlayerDinozInformationForTeam(userId);

	if (!body.team.every(id => playerDinoz.dinoz.map(d => d.id).includes(id))) {
		throw new ExpectedError('wrong player dinoz');
	}

	// Fill DOJO_OPPONENT_IN_SERIE (5) opponents
	const team = playerDinoz.dinoz.filter(d => body.team.includes(d.id));

	if (team.some(d => d.level < 10)) {
		throw new ExpectedError('dinoz level too low');
	}
	const opponentIds = await pickOpponentIds(team, myDojo.userId);
	const newChallenge = generateRandomChallenge();

	return reply.send(await replaceMyTeam(body.team, opponentIds, myDojo.id, newChallenge));
}

export async function getMyTeam(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	let myDojo = await getChallengeTeam(userId);

	if (!myDojo) {
		throw new ExpectedError('dojo not found');
	}

	if (myDojo.team.length === 0) {
		return reply.send(myDojo);
	}

	if (
		(myDojo.DojoOpponents.length === 0 || myDojo.DojoOpponents.every(d => d.achieved)) &&
		myDojo.dailyReset < DOJO_MAX_SERIES
	) {
		myDojo.team = await cleanCurrentOpponentTeam(myDojo.id);
		myDojo.DojoOpponents = await createOpponentTeam(
			myDojo.team.map(d => ({
				id: d.dinoz.id,
				level: d.dinoz.level
			})),
			myDojo
		);
	}

	return reply.send(myDojo);
}
