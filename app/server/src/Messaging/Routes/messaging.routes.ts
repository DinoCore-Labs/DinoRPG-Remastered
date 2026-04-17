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
		'/threads',
		{
			preHandler: [app.authenticate]
		},
		getThreadsController
	);

	app.get(
		'/threads/:id',
		{
			preHandler: [app.authenticate]
		},
		getThreadController
	);

	app.get(
		'/threads/:id/messages',
		{
			preHandler: [app.authenticate]
		},
		loadThreadMessagesController
	);

	app.post(
		'/threads',
		{
			preHandler: [app.authenticate]
		},
		createThreadController
	);

	app.post(
		'/threads/:id/messages',
		{
			preHandler: [app.authenticate]
		},
		answerThreadController
	);
}
