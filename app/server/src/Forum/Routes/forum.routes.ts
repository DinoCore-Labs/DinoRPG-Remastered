import type { FastifyInstance } from 'fastify';

import {
	createForumMessageBodySchema,
	createForumTopicBodySchema,
	forumCategoryParamSchema,
	forumMessageParamSchema,
	forumPageQuerySchema,
	forumSearchQuerySchema,
	forumTopicParamSchema,
	updateForumClosedBodySchema,
	updateForumMessageBodySchema,
	updateForumPinnedBodySchema
} from '../Schema/forum.schema.js';
import {
	createForumMessageHandler,
	createForumTopicHandler,
	deleteForumMessageHandler,
	getForumTopicHandler,
	listForumFavoritesHandler,
	listForumTopicsHandler,
	searchForumTopicsHandler,
	toggleForumFavoriteHandler,
	updateForumClosedHandler,
	updateForumMessageHandler,
	updateForumPinnedHandler
} from '../Service/forumHandler.service.js';

export async function forumRoutes(app: FastifyInstance) {
	app.get(
		'/categories/:category/topics',
		{
			preHandler: [app.noAuth],
			schema: {
				tags: ['Forum'],
				params: forumCategoryParamSchema,
				querystring: forumPageQuerySchema
			}
		},
		listForumTopicsHandler
	);
	app.get(
		'/favorites',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				querystring: forumPageQuerySchema
			}
		},
		listForumFavoritesHandler
	);
	app.get(
		'/topics/:topicId',
		{
			preHandler: [app.noAuth],
			schema: {
				tags: ['Forum'],
				params: forumTopicParamSchema,
				querystring: forumPageQuerySchema
			}
		},
		getForumTopicHandler
	);
	app.post(
		'/categories/:category/topics',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				params: forumCategoryParamSchema,
				body: createForumTopicBodySchema
			}
		},
		createForumTopicHandler
	);
	app.post(
		'/topics/:topicId/messages',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				params: forumTopicParamSchema,
				body: createForumMessageBodySchema
			}
		},
		createForumMessageHandler
	);
	app.patch(
		'/topics/:topicId/messages/:messageId',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				params: forumMessageParamSchema,
				body: updateForumMessageBodySchema
			}
		},
		updateForumMessageHandler
	);
	app.delete(
		'/topics/:topicId/messages/:messageId',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				params: forumMessageParamSchema
			}
		},
		deleteForumMessageHandler
	);
	app.post(
		'/topics/:topicId/favorite',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Forum'],
				params: forumTopicParamSchema
			}
		},
		toggleForumFavoriteHandler
	);
	/*
	 * Seuls :
	 *
	 * MODERATOR
	 * ADMIN
	 * SUPER_ADMIN
	 *
	 * passent le décorateur moderator.
	 */
	app.patch(
		'/topics/:topicId/pin',
		{
			preHandler: [app.authenticate, app.moderator],
			schema: {
				tags: ['Forum'],
				params: forumTopicParamSchema,
				body: updateForumPinnedBodySchema
			}
		},
		updateForumPinnedHandler
	);
	app.patch(
		'/topics/:topicId/closed',
		{
			preHandler: [app.authenticate, app.moderator],
			schema: {
				tags: ['Forum'],
				params: forumTopicParamSchema,
				body: updateForumClosedBodySchema
			}
		},
		updateForumClosedHandler
	);
	app.get(
		'/search',
		{
			preHandler: [app.noAuth],
			schema: {
				tags: ['Forum'],
				querystring: forumSearchQuerySchema
			}
		},
		searchForumTopicsHandler
	);
}
