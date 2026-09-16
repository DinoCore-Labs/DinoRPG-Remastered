import type { FastifyReply, FastifyRequest } from 'fastify';

import { Role } from '../../../../prisma/index.js';
import { forumService } from '../Controller/forum.controller.js';
import {
	createForumMessageBodySchema,
	createForumTopicBodySchema,
	forumCategoryParamSchema,
	forumMessageParamSchema,
	forumPageQuerySchema,
	forumSearchQuerySchema,
	forumTopicParamSchema,
	markForumTopicReadBodySchema,
	updateForumClosedBodySchema,
	updateForumMessageBodySchema,
	updateForumPinnedBodySchema
} from '../Schema/forum.schema.js';

type RequestUser = {
	id?: string;
	name?: string;
	role?: Role;
};

function optionalUserRole(req: FastifyRequest): Role | undefined {
	return (req.user as RequestUser | undefined)?.role;
}

function userId(req: FastifyRequest): string {
	const id = (req.user as RequestUser | undefined)?.id;
	if (!id) {
		throw new Error('Authenticated user is required');
	}
	return id;
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

export async function searchForumTopicsHandler(req: FastifyRequest, reply: FastifyReply) {
	const { q, page } = forumSearchQuerySchema.parse(req.query);
	return reply.send(await forumService.searchTopics(q, page, optionalUserId(req)));
}

export async function updateForumMessageHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId, messageId } = forumMessageParamSchema.parse(req.params);
	const body = updateForumMessageBodySchema.parse(req.body);
	return reply.send(await forumService.updateMessage(topicId, messageId, body, userId(req)));
}

export async function deleteForumMessageHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId, messageId } = forumMessageParamSchema.parse(req.params);
	return reply.send(await forumService.deleteMessage(topicId, messageId, userId(req), optionalUserRole(req)));
}

export async function getForumFirstUnreadHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);
	return reply.send(await forumService.getFirstUnread(topicId, userId(req)));
}

export async function markForumTopicReadHandler(req: FastifyRequest, reply: FastifyReply) {
	const { topicId } = forumTopicParamSchema.parse(req.params);
	const { messageId } = markForumTopicReadBodySchema.parse(req.body);
	return reply.send(await forumService.markTopicRead(topicId, messageId, userId(req)));
}
