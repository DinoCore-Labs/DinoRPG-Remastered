import type { FastifyReply, FastifyRequest } from 'fastify';

import { listAvailableDialogs } from './dialog.service.js';

type GetAvailableDialogsRequest = FastifyRequest<{
	Querystring: {
		dinozId: number;
	};
}>;

export async function getAvailableDialogsHandler(req: GetAvailableDialogsRequest, reply: FastifyReply) {
	const userId = req.user.id;

	const dialogs = await listAvailableDialogs({
		userId,
		dinozId: req.query.dinozId
	});

	return reply.status(200).send(dialogs);
}
