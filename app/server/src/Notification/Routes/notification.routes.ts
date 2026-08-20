import { FastifyInstance } from 'fastify';

import { deleteNotification, getUserNotifications } from '../Controller/notification.controller.js';

export async function notificationRoutes(app: FastifyInstance) {
	app.get(
		'/',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Notifications']
			}
		},
		getUserNotifications
	);

	app.delete(
		'/:id',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Notifications']
			}
		},
		deleteNotification
	);
}
