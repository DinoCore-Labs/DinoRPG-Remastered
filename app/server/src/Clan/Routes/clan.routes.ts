import { FastifyInstance } from 'fastify';

import { userIdParamSchema } from '../../User/Schema/user.schema.js';
import {
	clanHistoryPageSchema,
	clanIdParamSchema,
	clanMemberIdSchema,
	clanMessagesQuerySchema,
	clanRightParamSchema,
	createClanMessageSchema,
	createClanPageSchema,
	createClanSchema,
	giveIngredientBodySchema,
	joinRequestIdParamSchema,
	messageIdParamSchema,
	pageIdParamSchema,
	pageParamSchema,
	searchClansSchema,
	updateClanLangsResponseSchema,
	updateClanLangsSchema,
	updateClanMemberRequestBodySchema,
	updateClanPageSchema
} from '../Schema/clan.schema.js';
import {
	createClan,
	deleteClan,
	getClan,
	getClanBanner,
	getClansList,
	searchClansByName,
	updateClanBanner,
	updateClanLangs
} from '../Service/clan.service.js';
import {
	createClanMessage,
	deleteClanMessage,
	getClanMessages,
	getClanMessagesCount
} from '../Service/clanDiscussion.service.js';
import { getClanHistory } from '../Service/clanHistory.service.js';
import {
	acceptJoinClanRequest,
	denyJoinClanRequest,
	getJoinRequestslist,
	getSelfJoinRequest,
	joinClan
} from '../Service/clanJoinRequest.service.js';
import {
	excludeClanMember,
	getClanMember,
	getClanMembersList,
	getMemberHasRight,
	leaveClanSelf,
	updateClanLeader,
	updateClanMember
} from '../Service/clanMember.service.js';
import {
	createClanPage,
	deleteClanPage,
	getClanPage,
	getClanPages,
	updateClanPage
} from '../Service/clanPage.service.js';
import { getClanTreasure, giveIngredient } from '../Service/clanTreasure.service.js';

export async function clanRoutes(app: FastifyInstance) {
	app.post(
		'/create',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				body: createClanSchema
			}
		},
		createClan
	);
	app.get(
		'/:clanId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClan
	);
	app.put(
		'/:clanId/edit/langs',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema,
				body: updateClanLangsSchema,
				response: {
					200: updateClanLangsResponseSchema
				}
			}
		},
		updateClanLangs
	);
	app.delete(
		'/:clanId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		deleteClan
	);
	app.get(
		'/:clanId/banner',
		{
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClanBanner
	);
	app.put(
		'/:clanId/edit/banner',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		updateClanBanner
	);
	app.get(
		'/all/:page',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: pageParamSchema
			}
		},
		getClansList
	);
	app.get(
		'/search/:name/:page',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: searchClansSchema
			}
		},
		searchClansByName
	);

	app.get(
		'/:clanId/hasRight/:right',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(clanRightParamSchema)
			}
		},
		getMemberHasRight
	);
	app.get(
		'/:clanId/member/:memberId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(clanMemberIdSchema)
			}
		},
		getClanMember
	);
	app.get(
		'/:clanId/members',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClanMembersList
	);
	app.put(
		'/:clanId/member',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema,
				body: updateClanMemberRequestBodySchema
			}
		},
		updateClanMember
	);
	app.put(
		'/:clanId/leader/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(userIdParamSchema)
			}
		},
		updateClanLeader
	);
	app.delete(
		'/:clanId/member/:memberId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(clanMemberIdSchema)
			}
		},
		excludeClanMember
	);
	app.delete(
		'/member/self',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan']
			}
		},
		leaveClanSelf
	);

	app.get(
		'/page/:pageId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: pageIdParamSchema
			}
		},
		getClanPage
	);
	app.post(
		'/page',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				body: createClanPageSchema
			}
		},
		createClanPage
	);
	app.put(
		'/:clanId/page/:pageId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(pageIdParamSchema),
				body: updateClanPageSchema
			}
		},
		updateClanPage
	);
	app.delete(
		'/:clanId/page/:pageId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(pageIdParamSchema)
			}
		},
		deleteClanPage
	);
	app.get(
		'/:clanId/pages',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClanPages
	);

	app.get(
		'/:clanId/history/:page',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(clanHistoryPageSchema)
			}
		},
		getClanHistory
	);

	app.get(
		'/:clanId/requests',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getJoinRequestslist
	);
	app.post(
		'/request/:requestId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: joinRequestIdParamSchema
			}
		},
		acceptJoinClanRequest
	);
	app.delete(
		'/request/:requestId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: joinRequestIdParamSchema
			}
		},
		denyJoinClanRequest
	);
	app.post(
		'/:clanId/join',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		joinClan
	);
	app.get(
		'/joinRequest',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan']
			}
		},
		getSelfJoinRequest
	);

	app.get(
		'/:clanId/treasure',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClanTreasure
	);
	app.post(
		'/:clanId/give',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema,
				body: giveIngredientBodySchema
			}
		},
		giveIngredient
	);
	// discussion forum routes
	app.get(
		'/:clanId/messages',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema,
				querystring: clanMessagesQuerySchema
			}
		},
		getClanMessages
	);
	app.get(
		'/:clanId/messages/count',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema
			}
		},
		getClanMessagesCount
	);
	app.post(
		'/:clanId/messages',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema,
				body: createClanMessageSchema
			}
		},
		createClanMessage
	);
	app.delete(
		'/:clanId/messages/:messageId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Clan'],
				params: clanIdParamSchema.merge(messageIdParamSchema)
			}
		},
		deleteClanMessage
	);
}
