import type { FastifyReply, FastifyRequest } from 'fastify';

import { getThread, getThreads, loadThreadMessages } from '../Controller/read.controller.js';
import { answerThread, createThread } from '../Controller/write.controller.js';
import {
	answerThreadBodySchema,
	createThreadBodySchema,
	threadIdParamsSchema,
	threadMessagesQuerySchema
} from '../Schema/messaging.schema.js';

type AuthenticatedRequest = FastifyRequest & {
	user: {
		id: string;
	};
};

export async function getThreadsController(req: AuthenticatedRequest, reply: FastifyReply) {
	return reply.send(await getThreads(req.user.id));
}

export async function getThreadController(req: AuthenticatedRequest, reply: FastifyReply) {
	const params = threadIdParamsSchema.parse(req.params);
	return reply.send(await getThread(params.id, req.user.id));
}

export async function loadThreadMessagesController(req: AuthenticatedRequest, reply: FastifyReply) {
	const params = threadIdParamsSchema.parse(req.params);
	const query = threadMessagesQuerySchema.parse(req.query);

	return reply.send(await loadThreadMessages(params.id, req.user.id, query.page ?? 1));
}

export async function createThreadController(req: AuthenticatedRequest, reply: FastifyReply) {
	const body = createThreadBodySchema.parse(req.body);
	return reply.send(await createThread(req.user.id, body));
}

export async function answerThreadController(req: AuthenticatedRequest, reply: FastifyReply) {
	const params = threadIdParamsSchema.parse(req.params);
	const body = answerThreadBodySchema.parse(req.body);

	return reply.send(await answerThread(params.id, req.user.id, body));
}
