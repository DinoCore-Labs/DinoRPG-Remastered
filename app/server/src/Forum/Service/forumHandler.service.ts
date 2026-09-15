import type { FastifyReply, FastifyRequest } from 'fastify';

import { forumService } from '../Controller/forum.controller.js';
import {
	createForumMessageBodySchema,
	createForumTopicBodySchema,
	forumCategoryParamSchema,
	forumPageQuerySchema,
	forumTopicParamSchema,
	updateForumClosedBodySchema,
	updateForumPinnedBodySchema
} from '../Schema/forum.schema.js';

type RequestUser = {
	id: string;
	name: string;
};

function userId(req: FastifyRequest): string {
	return (req.user as RequestUser).id;
}

function optionalUserId(req: FastifyRequest): string | undefined {
	return (req.user as RequestUser | undefined)?.id;
}

export async function listForumTopicsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { category } = forumCategoryParamSchema.parse(req.params);

	const { page } = forumPageQuerySchema.parse(req.query);

	return reply.send(await forumService.listTopics(category, page, optionalUserId(req)));
}

export async function listForumFavoritesHandler(req: FastifyRequest, reply: FastifyReply) {
	const { page } = forumPageQuerySchema.parse(req.query);

	return reply.send(await forumService.listFavorites(userId(req), page));
}

export async function getForumTopicHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);

	const { page } = forumPageQuerySchema.parse(req.query);

	return reply.send(await forumService.getTopic(topicId, page, optionalUserId(req)));
}

export async function createForumTopicHandler(req: FastifyRequest, reply: FastifyReply) {
	const { category } = forumCategoryParamSchema.parse(req.params);

	const body = createForumTopicBodySchema.parse(req.body);

	const topic = await forumService.createTopic(category, body, userId(req));

	return reply.code(201).send(topic);
}

export async function createForumMessageHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);

	const body = createForumMessageBodySchema.parse(req.body);

	const result = await forumService.createMessage(topicId, body, userId(req));

	return reply.code(201).send(result);
}

export async function toggleForumFavoriteHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);

	return reply.send(await forumService.toggleFavorite(topicId, userId(req)));
}

export async function updateForumPinnedHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);

	const { isPinned } = updateForumPinnedBodySchema.parse(req.body);

	return reply.send(await forumService.setPinned(topicId, isPinned));
}

export async function updateForumClosedHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);

	const { isClosed } = updateForumClosedBodySchema.parse(req.body);

	return reply.send(await forumService.setClosed(topicId, isClosed));
}
