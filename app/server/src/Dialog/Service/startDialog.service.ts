import type { FastifyReply, FastifyRequest } from 'fastify';

import { startDialog } from './dialog.service.js';

type StartDialogRequest = FastifyRequest<{
	Params: {
		dialogId: string;
	};
	Querystring: {
		dinozId: number;
	};
}>;

export async function startDialogHandler(req: StartDialogRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const phase = await startDialog({
		userId,
		dinozId: req.query.dinozId,
		dialogId: req.params.dialogId
	});
	return reply.status(200).send(phase);
}
