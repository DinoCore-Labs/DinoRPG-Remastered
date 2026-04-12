import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { completeMissionInteraction, startMissionInteraction } from '../Controller/missionInteract.controller.js';

const paramsSchema = z.object({
	id: z.coerce.number()
});

export async function startMissionInteractionController(req: FastifyRequest, reply: FastifyReply) {
	const { id } = paramsSchema.parse(req.params);

	const result = await startMissionInteraction(req.user.id, id);

	return reply.send(result);
}

export async function completeMissionInteractionController(req: FastifyRequest, reply: FastifyReply) {
	const { id } = paramsSchema.parse(req.params);

	const result = await completeMissionInteraction({
		userId: req.user.id,
		dinozId: id,
		trigger: 'manual'
	});

	return reply.send(result);
}
