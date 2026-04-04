import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { dialogIdParamsSchema, dialogPhaseBodySchema, dialogQuerySchema } from '../Schema/dialog.schema.js';
import { resumeDialogPhase } from './dialog.service.js';

type ResumeDialogRequest = FastifyRequest<{
	Params: z.infer<typeof dialogIdParamsSchema>;
	Querystring: z.infer<typeof dialogQuerySchema>;
	Body: z.infer<typeof dialogPhaseBodySchema>;
}>;

export async function resumeDialogHandler(req: ResumeDialogRequest, reply: FastifyReply) {
	const result = await resumeDialogPhase({
		userId: req.user.id,
		dinozId: req.query.dinozId,
		dialogId: req.params.dialogId,
		phaseId: req.body.phaseId
	});

	return reply.send(result);
}
