import type { FastifyInstance } from 'fastify';

import {
	answerThreadController,
	createThreadController,
	getThreadController,
	getThreadsController,
	loadThreadMessagesController
} from '../Service/messaging.service.js';

export async function messagingRoutes(app: FastifyInstance) {
	app.get(
		'/messaging/threads',
		{
			preHandler: [app.authenticate]
		},
		getThreadsController
	);

	app.get(
		'/messaging/threads/:id',
		{
			preHandler: [app.authenticate]
		},
		getThreadController
	);

	app.get(
		'/messaging/threads/:id/messages',
		{
			preHandler: [app.authenticate]
		},
		loadThreadMessagesController
	);

	app.post(
		'/messaging/threads',
		{
			preHandler: [app.authenticate]
		},
		createThreadController
	);

	app.post(
		'/messaging/threads/:id/messages',
		{
			preHandler: [app.authenticate]
		},
		answerThreadController
	);
}
