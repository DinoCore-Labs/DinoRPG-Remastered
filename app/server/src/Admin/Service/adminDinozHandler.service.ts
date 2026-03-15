import type { FastifyReply, FastifyRequest } from 'fastify';

import { DinozState } from '../../../../prisma/index.js';
import {
	addAdminDinozSkill,
	addAdminDinozStatus,
	addAdminDinozUnlockableSkill,
	getAdminDinozDetails,
	removeAdminDinozSkill,
	removeAdminDinozStatus,
	removeAdminDinozUnlockableSkill,
	teleportAdminDinoz,
	updateAdminDinozItems,
	updateAdminDinozLeader,
	updateAdminDinozProfile,
	updateAdminDinozSkillState,
	updateAdminDinozState,
	updateAdminDinozStats
} from '../Controller/adminDinoz.controller.js';

type Params = {
	userId: string;
	dinozId: number;
};

export async function getAdminDinozDetailsHandler(request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const data = await getAdminDinozDetails(request.params.userId, Number(request.params.dinozId));
	return reply.send(data);
}

export async function updateAdminDinozProfileHandler(
	request: FastifyRequest<{
		Params: Params;
		Body: {
			name: string;
			canRename: boolean;
			raceId: number;
			display: string;
		};
	}>,
	reply: FastifyReply
) {
	await updateAdminDinozProfile(request.params.userId, Number(request.params.dinozId), request.body);
	return reply.send({ ok: true });
}

export async function updateAdminDinozStatsHandler(
	request: FastifyRequest<{
		Params: Params;
		Body: {
			level: number;
			life: number;
			maxLife: number;
			experience: number;
			nbrUpFire: number;
			nbrUpWood: number;
			nbrUpWater: number;
			nbrUpLightning: number;
			nbrUpAir: number;
			nextUpElementId: number;
			nextUpAltElementId: number;
			remaining: number;
			order: number | null;
			fight: boolean;
			gather: boolean;
		};
	}>,
	reply: FastifyReply
) {
	await updateAdminDinozStats(request.params.userId, Number(request.params.dinozId), request.body);
	return reply.send({ ok: true });
}

export async function updateAdminDinozStateHandler(
	request: FastifyRequest<{
		Params: Params;
		Body: {
			state: DinozState | null;
			stateTimer: string | null;
		};
	}>,
	reply: FastifyReply
) {
	await updateAdminDinozState(request.params.userId, Number(request.params.dinozId), request.body);
	return reply.send({ ok: true });
}

export async function teleportAdminDinozHandler(
	request: FastifyRequest<{ Params: Params; Body: { placeId: number } }>,
	reply: FastifyReply
) {
	await teleportAdminDinoz(request.params.userId, Number(request.params.dinozId), request.body.placeId);
	return reply.send({ ok: true });
}

export async function updateAdminDinozLeaderHandler(
	request: FastifyRequest<{ Params: Params; Body: { leaderId: number | null } }>,
	reply: FastifyReply
) {
	await updateAdminDinozLeader(request.params.userId, Number(request.params.dinozId), request.body.leaderId);
	return reply.send({ ok: true });
}

export async function addAdminDinozStatusHandler(
	request: FastifyRequest<{ Params: Params; Body: { statusId: number } }>,
	reply: FastifyReply
) {
	await addAdminDinozStatus(request.params.userId, Number(request.params.dinozId), request.body.statusId);
	return reply.send({ ok: true });
}

export async function removeAdminDinozStatusHandler(
	request: FastifyRequest<{ Params: Params; Body: { statusId: number } }>,
	reply: FastifyReply
) {
	await removeAdminDinozStatus(request.params.userId, Number(request.params.dinozId), request.body.statusId);
	return reply.send({ ok: true });
}

export async function addAdminDinozSkillHandler(
	request: FastifyRequest<{ Params: Params; Body: { skillId: number; state?: boolean } }>,
	reply: FastifyReply
) {
	await addAdminDinozSkill(request.params.userId, Number(request.params.dinozId), request.body);
	return reply.send({ ok: true });
}

export async function updateAdminDinozSkillStateHandler(
	request: FastifyRequest<{ Params: Params; Body: { skillId: number; state: boolean } }>,
	reply: FastifyReply
) {
	await updateAdminDinozSkillState(request.params.userId, Number(request.params.dinozId), request.body);
	return reply.send({ ok: true });
}

export async function removeAdminDinozSkillHandler(
	request: FastifyRequest<{ Params: Params; Body: { skillId: number } }>,
	reply: FastifyReply
) {
	await removeAdminDinozSkill(request.params.userId, Number(request.params.dinozId), request.body.skillId);
	return reply.send({ ok: true });
}

export async function addAdminDinozUnlockableSkillController(
	request: FastifyRequest<{ Params: Params; Body: { skillId: number } }>,
	reply: FastifyReply
) {
	await addAdminDinozUnlockableSkill(request.params.userId, Number(request.params.dinozId), request.body.skillId);

	return reply.send({ ok: true });
}

export async function removeAdminDinozUnlockableSkillController(
	request: FastifyRequest<{ Params: Params; Body: { skillId: number } }>,
	reply: FastifyReply
) {
	await removeAdminDinozUnlockableSkill(request.params.userId, Number(request.params.dinozId), request.body.skillId);

	return reply.send({ ok: true });
}

export async function updateAdminDinozItemsHandler(
	request: FastifyRequest<{ Params: Params; Body: { entries: { itemId: number; quantity: number }[] } }>,
	reply: FastifyReply
) {
	await updateAdminDinozItems(request.params.userId, Number(request.params.dinozId), request.body.entries);
	return reply.send({ ok: true });
}
