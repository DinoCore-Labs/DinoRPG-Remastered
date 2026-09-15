import type { FastifyInstance } from 'fastify';

import {
	createForumMessageBodySchema,
	createForumTopicBodySchema,
	forumCategoryParamSchema,
	forumPageQuerySchema,
	forumTopicParamSchema,
	updateForumClosedBodySchema,
	updateForumPinnedBodySchema
} from '../Schema/forum.schema.js';
import {
	createForumMessageHandler,
	createForumTopicHandler,
	getForumTopicHandler,
	listForumFavoritesHandler,
	listForumTopicsHandler,
	toggleForumFavoriteHandler,
	updateForumClosedHandler,
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
			preHandler: [app.authenticate, app.moderator, app.admin],
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
}
