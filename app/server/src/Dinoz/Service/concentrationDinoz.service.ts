import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { enterDarkPortal, stopDinozConcentration } from '../Controller/concentrationDinoz.controller.js';

type Params = {
	id: string;
};

export async function stopDinozConcentrationHandler(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;
	await stopDinozConcentration(userId, dinozId);
	return reply.send({
		ok: true
	});
}

export async function enterDarkPortalHandler(req: FastifyRequest<{ Params: Params }>, reply: FastifyReply) {
	const dinozId = Number(req.params.id);
	const userId = req.user.id;
	await enterDarkPortal(userId, dinozId);
	return reply.send({
		ok: true,
		placeId: PlaceEnum.PORTAIL
	});
}
