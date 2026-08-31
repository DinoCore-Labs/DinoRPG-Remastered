/**
 * This file contains code derived from or adapted from:
 * Eternaltwin DinoRPG
 * Upstream file: https://gitlab.com/eternaltwin/dinorpg/dinorpg/-/blob/staging/ed-be/src/business/dojoService.ts
 *
 * Copyright in the original contributions remains with the respective
 * authors and contributors.
 *
 * Modified by DinoRPG Remastered contributors on 2026-08-31.
 * See NOTICE.md and the Git history for provenance and modification details.
 *
 * SPDX-License-Identifier: AGPL-3.0-or-later
 */

import { DOJO_FIGHT_FRIENDS_DINOZ_COST } from '@dinorpg/core/models/dojo/constants.js';
import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FighterRecap, FightOutcome, FightProcessResult } from '@dinorpg/core/models/fight/fightResult.js';
import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { calculateFightBetweenPlayers } from '../../Fight/Service/fight.service.js';
import { prisma } from '../../prisma.js';
import { removeMoney } from '../../User/Controller/money.controller.js';
import { DOJO_CHALLENGE_RULES } from '../../utils/fight/fight.mapper.js';
import { availableDinozIds, getDojoFightPreparationRequest } from '../Controller/dojoFight.controller.js';
import { fightTestSchema } from '../Schema/dojo.schema.js';
import { getLatestTournament } from './dojoTournament.service.js';

export async function getDinozForDojoFight(dinozIds: number[]) {
	const dinoz = await prisma.dinoz.findMany({
		where: { id: { in: dinozIds } },
		select: {
			id: true,
			userId: true,
			display: true,
			name: true,
			level: true,
			life: true,
			maxLife: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			skills: {
				select: { skillId: true },
				where: { state: { equals: true } }
			},
			items: {
				select: {
					itemId: true
				}
			},
			status: {
				select: {
					statusId: true
				}
			},
			catches: { select: { id: true, hp: true, monsterId: true } }
		}
	});
	return dinoz;
}

export async function dojoTest(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = fightTestSchema.parse(req.body);
	const fightCost = (body.leftTeam.length + body.rightTeam.length) * DOJO_FIGHT_FRIENDS_DINOZ_COST;

	const leftUser = await getDojoFightPreparationRequest(userId);
	if (!leftUser || !body.leftTeam.every(id => availableDinozIds(leftUser.dinoz).includes(id))) {
		throw new ExpectedError('dojo.dinozNotUser');
	}
	const rightUser = await getDojoFightPreparationRequest(body.opponentId);
	if (!rightUser) {
		throw new ExpectedError('dojo.inexistantOpponent');
	}
	if (!body.rightTeam.every(id => availableDinozIds(rightUser.dinoz).includes(id))) {
		throw new ExpectedError('dojo.dinozNotUser');
	}

	const rightTeam = await getDinozForDojoFight(body.rightTeam);
	const leftTeam = await getDinozForDojoFight(body.leftTeam);

	rightTeam.map(d => {
		d.items = d.items.filter(i =>
			Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
		);
		d.life = d.maxLife;
	});
	leftTeam.map(d => {
		d.items = d.items.filter(i =>
			Object.values(itemList).find(item => item.itemId === i.itemId && item.itemType === ItemType.MAGICAL)
		);
		d.life = d.maxLife;
	});

	const fightResult = calculateFightBetweenPlayers(
		DOJO_CHALLENGE_RULES,
		leftTeam,
		leftUser.cooker,
		rightTeam,
		rightUser.cooker,
		PlaceEnum.DOJO
	);

	await removeMoney(userId, fightCost);

	const tournament = await getLatestTournament();
	if (tournament) {
		await prisma.tournament.update({
			where: {
				id: tournament.id
			},
			data: {
				cashPrice: {
					increment: fightCost
				}
			}
		});
	}

	const fightArchive = await archiveFight(
		fightResult,
		fightResult.outcome === FightOutcome.AttackerWin, // Save if one or the other win, the detail is not important
		userId,
		body.opponentId
	);
	return reply.send({ fight: fightArchive, stats: fightResult.stats });
}

export async function archiveFight(
	fight: FightProcessResult,
	winner: boolean,
	leftUserId: string,
	rightUserId: string | null,
	metaData?: string
) {
	const UserSelect = { select: { id: true, name: true } };
	const archive = await prisma.fightArchive.create({
		data: {
			fighters: JSON.stringify(
				fight.fighters.map(f => {
					return {
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
					};
				})
			),
			steps: JSON.stringify(fight.steps),
			seed: fight.seed,
			result: winner,
			user: { connect: { id: leftUserId } },
			leftUser: { connect: { id: leftUserId } },
			rightUser: rightUserId ? { connect: { id: rightUserId } } : undefined,
			metadata: metaData
		},
		select: {
			id: true,
			fighters: true,
			steps: true,
			seed: true,
			result: true,
			leftUser: UserSelect,
			rightUser: UserSelect
		}
	});
	return {
		id: archive.id,
		fighters: JSON.parse(archive.fighters) as FighterRecap[],
		result: archive.result,
		history: JSON.parse(archive.steps) as FightStep[],
		seed: archive.seed,
		leftUser: archive.leftUser,
		rightUser: archive.rightUser,
		place: fight.place
	};
}
