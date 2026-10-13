import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

import { completeMissionInteraction, startMissionInteraction } from '../Controller/missionInteract.controller.js';

const paramsSchema = z.object({
	id: z.coerce.number()
});
const startBodySchema = z.object({
	autoReequip: z.boolean().optional()
});
const completeBodySchema = z.object({
	trigger: z.enum(['manual', 'fight_victory']).default('manual')
});

export async function startMissionInteractionController(req: FastifyRequest, reply: FastifyReply) {
	const { id } = paramsSchema.parse(req.params);
	const body = startBodySchema.parse(req.body ?? {});
	const result = await startMissionInteraction(req.user.id, id, body.autoReequip);
	req.log.info(
		{
			category: 'mission',
			action: 'interaction_started',
			userId: req.user.id,
			dinozId: id,
			requestId: req.id
		},
		'Mission interaction started'
	);
	return reply.send(result);
}

export async function completeMissionInteractionController(req: FastifyRequest, reply: FastifyReply) {
	const { id } = paramsSchema.parse(req.params);
	const body = completeBodySchema.parse(req.body ?? {});
	const result = await completeMissionInteraction({
		userId: req.user.id,
		dinozId: id,
		trigger: body.trigger
	});
	req.log.info(
		{
			category: 'mission',
			action: 'interaction_completed',
			userId: req.user.id,
			dinozId: id,
			trigger: body.trigger,
			requestId: req.id
		},
		'Mission interaction completed'
	);
	return reply.send(result);
}
