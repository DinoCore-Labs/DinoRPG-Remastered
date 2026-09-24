import { DOJO_COST } from '@dinorpg/core/models/dojo/constants.js';
import { DOJO_SCENARIO_KEY, DOJO_SCENARIO_STEPS } from '@dinorpg/core/models/scenarios/data/dojoScenario.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { GameLogType, MoneyType, Prisma } from '../../../../prisma/index.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
import { prisma } from '../../prisma.js';
import { removeMoneyTx } from '../../User/Controller/money.controller.js';
import TournamentManager from '../../utils/tournamentManager.js';

type DojoTransaction = Prisma.TransactionClient;

export async function buildDojoTx(tx: DojoTransaction, userId: string) {
	/*
	 * Protection d'un éventuel état incohérent :
	 * dojo déjà présent mais progression scénario
	 * encore à 1.
	 */
	const existingDojo = await tx.dojo.findUnique({
		where: {
			userId
		},
		select: {
			id: true
		}
	});
	if (existingDojo) {
		throw new ExpectedError('dojo already built');
	}
	/*
	 * Claim atomique.
	 *
	 * Une seule transaction peut passer
	 * de UNLOCKED à BUILT.
	 */
	const claim = await tx.userScenario.updateMany({
		where: {
			userId,
			scenarioKey: DOJO_SCENARIO_KEY,
			progression: DOJO_SCENARIO_STEPS.UNLOCKED
		},
		data: {
			progression: DOJO_SCENARIO_STEPS.BUILT
		}
	});
	if (claim.count !== 1) {
		const scenario = await tx.userScenario.findUnique({
			where: {
				scenarioKey_userId: {
					userId,
					scenarioKey: DOJO_SCENARIO_KEY
				}
			},
			select: {
				progression: true
			}
		});
		if (!scenario || scenario.progression < DOJO_SCENARIO_STEPS.UNLOCKED) {
			throw new ExpectedError('dojo not unlocked');
		}
		throw new ExpectedError('dojo already built');
	}
	/*
	 * Même transaction :
	 *
	 * progression 1 -> 2
	 * débit 50 000
	 * création dojo
	 *
	 * Une erreur sur n'importe quelle étape
	 * rollback tout.
	 */
	const wallet = await removeMoneyTx(tx, userId, DOJO_COST);
	const dojo = await tx.dojo.create({
		data: {
			userId
		}
	});
	return {
		dojo,
		wallet
	};
}

export async function buildDojo(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const { dojo, wallet } = await prisma.$transaction(tx => buildDojoTx(tx, userId));
	/*
	 * Le log n'est créé qu'après le commit.
	 */
	safeCreateGameLog(
		{
			type: GameLogType.GoldLost,
			userId,
			values: [String(DOJO_COST)],
			metadata: {
				amount: DOJO_COST,
				wallet: MoneyType.GOLD,
				previousAmount: wallet.amount + DOJO_COST,
				newAmount: wallet.amount,
				source: 'dojo'
			}
		},
		req.log
	);
	return reply.send({
		dojoId: dojo.id
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
