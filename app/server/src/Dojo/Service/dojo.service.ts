import { DOJO_COST } from '@dinorpg/core/models/dojo/constants.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import {
	getUserScenarioProgression,
	incrementUserScenarioProgression
} from '../../Scenario/Controller/scenarioProgress.controller.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import TournamentManager from '../../utils/tournamentManager.js';

export async function buildDojo(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;

	return prisma.$transaction(async tx => {
		const { progression } = await getUserScenarioProgression(tx, userId, 'dojo');

		if (progression < 1) {
			throw new ExpectedError('dojo not unlocked');
		}

		if (progression >= 2) {
			throw new ExpectedError('dojo already built');
		}

		try {
			await removeMoney(userId, DOJO_COST);
		} catch (error) {
			throw new ExpectedError('not enough gold');
		}

		const dojo = await tx.dojo.create({
			data: {
				userId
			}
		});

		await incrementUserScenarioProgression(tx, {
			userId,
			scenarioKey: 'dojo',
			delta: 1
		});

		return reply.send({
			dojoId: dojo.id
		});
	});
}

export async function getMyDojo(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const dojo = await prisma.dojo.findUnique({
		where: {
			userId: userId
		},
		select: {
			DojoChallengeHistory: {
				select: {
					victory: true,
					achieved: true
				}
			},
			id: true,
			userId: true,
			reputation: true,
			activeChallenge: true,
			TournamentTeam: true
		}
	});

	if (!dojo) {
		throw new ExpectedError('dojoNotFound');
	}

	const ranking = await prisma.ranking.findUnique({
		where: { userId }
	});

	const tournament = await TournamentManager.getCurrentTournamentState(prisma);
	return reply.send({ dojo: dojo, rank: ranking?.dojo ?? 0, tournament });
}
