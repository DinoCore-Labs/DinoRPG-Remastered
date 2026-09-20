import { FastifyReply, FastifyRequest } from 'fastify';

import { getOrCreateDinozShop } from '../Controller/getOrCreateDinozShop.controller.js';

export async function getDinozFromDinozShop(req: FastifyRequest, _reply: FastifyReply) {
	const userId = req.user.id;
	return getOrCreateDinozShop(userId);
}
