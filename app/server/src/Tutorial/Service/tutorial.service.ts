import type { FastifyReply, FastifyRequest } from 'fastify';

import { getCurrentTutorial } from '../Controller/tutorial.controller.js';

export async function getCurrentTutorialController(req: FastifyRequest, reply: FastifyReply) {
	return reply.send(await getCurrentTutorial(req.user.id));
}
