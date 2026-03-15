import type { UpdateAdminDinozBody } from '@dinorpg/core/models/admin/adminDinoz.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { getAdminDinozById, updateAdminDinoz } from '../Controller/adminDinoz.controller.js';

export async function getAdminDinozController(
	request: FastifyRequest<{
		Params: { dinozId: number };
		Querystring: { playerId: string };
	}>,
	reply: FastifyReply
) {
	const dinoz = await getAdminDinozById(request.query.playerId, request.params.dinozId);
	return reply.status(200).send(dinoz);
}

export async function updateAdminDinozController(
	request: FastifyRequest<{
		Params: { dinozId: number };
		Body: UpdateAdminDinozBody;
	}>,
	reply: FastifyReply
) {
	const dinoz = await updateAdminDinoz(request.params.dinozId, request.body);
	return reply.status(200).send(dinoz);
}
