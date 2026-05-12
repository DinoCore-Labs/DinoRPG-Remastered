// app/server/src/Admin/Service/adminForcebrutHandler.service.ts

import type { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';
import {
	type AdminForcebrutOpponentBody,
	adminForcebrutOpponentBodySchema,
	type AdminForcebrutOpponentParams,
	adminForcebrutOpponentParamsSchema
} from '../Schema/admin.schema.js';

function toAdminForcebrutOpponent(opponent: {
	id: number;
	step: number;
	name: string;
	raceId: number;
	display: string;
	level: number;
	life: number;
	maxLife: number;
	experience: number;
	nbrUpFire: number;
	nbrUpWood: number;
	nbrUpWater: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skillIds: number[];
	itemIds: number[];
	statusIds: number[];
	enabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}) {
	return {
		...opponent,
		createdAt: opponent.createdAt.toISOString(),
		updatedAt: opponent.updatedAt.toISOString()
	};
}

export async function getAdminForcebrutOpponentsHandler(_request: FastifyRequest, reply: FastifyReply) {
	const opponents = await prisma.forcebrutTournamentOpponent.findMany({
		orderBy: {
			step: 'asc'
		}
	});

	return reply.status(200).send(opponents.map(toAdminForcebrutOpponent));
}

export async function getAdminForcebrutOpponentDetailsHandler(
	request: FastifyRequest<{ Params: AdminForcebrutOpponentParams }>,
	reply: FastifyReply
) {
	const { id } = adminForcebrutOpponentParamsSchema.parse(request.params);

	const opponent = await prisma.forcebrutTournamentOpponent.findUnique({
		where: {
			id
		}
	});

	if (!opponent) {
		return reply.status(404).send({ message: 'Forcebrut opponent not found' });
	}

	return reply.status(200).send(toAdminForcebrutOpponent(opponent));
}

export async function createAdminForcebrutOpponentHandler(
	request: FastifyRequest<{ Body: AdminForcebrutOpponentBody }>,
	reply: FastifyReply
) {
	const payload = adminForcebrutOpponentBodySchema.parse(request.body);

	const existingStep = await prisma.forcebrutTournamentOpponent.findUnique({
		where: {
			step: payload.step
		},
		select: {
			id: true
		}
	});

	if (existingStep) {
		return reply.status(409).send({
			message: `Un adversaire existe déjà pour le palier ${payload.step}.`
		});
	}

	const opponent = await prisma.forcebrutTournamentOpponent.create({
		data: payload
	});

	return reply.status(201).send(toAdminForcebrutOpponent(opponent));
}

export async function updateAdminForcebrutOpponentHandler(
	request: FastifyRequest<{
		Params: AdminForcebrutOpponentParams;
		Body: AdminForcebrutOpponentBody;
	}>,
	reply: FastifyReply
) {
	const { id } = adminForcebrutOpponentParamsSchema.parse(request.params);
	const payload = adminForcebrutOpponentBodySchema.parse(request.body);

	const existingOpponent = await prisma.forcebrutTournamentOpponent.findUnique({
		where: {
			id
		},
		select: {
			id: true
		}
	});

	if (!existingOpponent) {
		return reply.status(404).send({ message: 'Forcebrut opponent not found' });
	}

	const existingStep = await prisma.forcebrutTournamentOpponent.findUnique({
		where: {
			step: payload.step
		},
		select: {
			id: true
		}
	});

	if (existingStep && existingStep.id !== id) {
		return reply.status(409).send({
			message: `Un autre adversaire existe déjà pour le palier ${payload.step}.`
		});
	}

	const opponent = await prisma.forcebrutTournamentOpponent.update({
		where: {
			id
		},
		data: payload
	});

	return reply.status(200).send(toAdminForcebrutOpponent(opponent));
}

export async function deleteAdminForcebrutOpponentHandler(
	request: FastifyRequest<{ Params: AdminForcebrutOpponentParams }>,
	reply: FastifyReply
) {
	const { id } = adminForcebrutOpponentParamsSchema.parse(request.params);

	const existingOpponent = await prisma.forcebrutTournamentOpponent.findUnique({
		where: {
			id
		},
		select: {
			id: true
		}
	});

	if (!existingOpponent) {
		return reply.status(404).send({ message: 'Forcebrut opponent not found' });
	}

	await prisma.forcebrutTournamentOpponent.delete({
		where: {
			id
		}
	});

	return reply.status(200).send({ ok: true });
}
