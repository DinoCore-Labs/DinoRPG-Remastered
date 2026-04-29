import type { FastifyReply, FastifyRequest } from 'fastify';

import { selectDialogLink } from './dialog.service.js';

type SelectDialogLinkRequest = FastifyRequest<{
	Params: {
		dialogId: string;
		linkId: string;
	};
	Querystring: {
		dinozId: number;
	};
	Body: {
		phaseId: string;
	};
}>;

export async function selectDialogLinkHandler(req: SelectDialogLinkRequest, reply: FastifyReply) {
	const userId = req.user.id;
	const phase = await selectDialogLink({
		userId,
		dinozId: req.query.dinozId,
		dialogId: req.params.dialogId,
		phaseId: req.body.phaseId,
		linkId: req.params.linkId
	});
	return reply.status(200).send(phase);
}
