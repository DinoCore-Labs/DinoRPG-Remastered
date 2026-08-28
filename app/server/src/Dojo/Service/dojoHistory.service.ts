import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { FighterRecap } from '@dinorpg/core/models/fight/fightResult.js';
import { FightStep } from '@dinorpg/core/models/fight/fightStep.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import { dojoHistoryPageSchema, sharedFightSchema } from '../Schema/dojo.schema.js';
import { viewFight } from './dojoTournament.service.js';

export async function getMyHistory(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const page = dojoHistoryPageSchema.parse(req.params).page;

	const totalArchive = await prisma.fightArchive.count({ where: { userId } });
	const archive = await prisma.fightArchive.findMany({
		take: 10,
		skip: 10 * page - 10,
		where: {
			userId
		},
		select: {
			id: true,
			fighters: true,
			metadata: true
		},
		orderBy: {
			createdDate: 'desc'
		}
	});

	if (!archive) {
		throw new ExpectedError('Archive not found');
	}
	const fights = archive
		.filter(f => {
			if (f.metadata) {
				const metadata = JSON.parse(f.metadata);
				return metadata.placeId === PlaceEnum.DOJO;
			} else {
				return true;
			}
		})
		.map(f => {
			return {
				fighters: JSON.parse(f.fighters) as FighterRecap[],
				id: f.id
			};
		});

	return reply.send({ archive: fights, quantity: totalArchive });
}

export async function getArchivedFight(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const body = sharedFightSchema.parse(req.params);
	const userSelect = { select: { id: true, name: true } };
	const fight = await prisma.fightArchive.findFirst({
		where: {
			id: body.id
		},
		select: {
			fighters: true,
			steps: true,
			seed: true,
			result: true,
			leftUser: userSelect,
			rightUser: userSelect,
			metadata: true
		}
	});

	if (!fight) {
		throw new ExpectedError('archived fight not found');
	}

	await viewFight(userId, body.id);

	let place = 996; // PlaceEnum.DOJO
	let background: string | undefined;
	if (fight.metadata) {
		try {
			const meta = JSON.parse(fight.metadata as string);
			if (meta.placeId) place = meta.placeId;
			else if (meta.place) place = meta.place;
			if (meta.background) background = meta.background;
		} catch {}
	}

	return reply.send({
		fight: {
			id: body.id,
			fighters: JSON.parse(fight.fighters) as FighterRecap[],
			result: fight.result,
			history: JSON.parse(fight.steps) as FightStep[],
			seed: fight.seed,
			leftUser: fight.leftUser,
			rightUser: fight.rightUser,
			place,
			background
		}
	});
}

export async function tournamentsHistory(req: FastifyRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const param = dojoHistoryPageSchema.parse(req.params);
	const [count, history] = await prisma.$transaction([
		prisma.tournament.count(),
		prisma.tournament.findMany({
			take: 10,
			skip: 10 * (param.page - 1),
			orderBy: {
				date: 'desc'
			},
			select: {
				id: true,
				date: true,
				formatName: true
			}
		})
	]);
	return reply.send({ count, history });
}
