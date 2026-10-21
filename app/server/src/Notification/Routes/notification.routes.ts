import { FastifyInstance } from 'fastify';

import {
	deleteAllNotifications,
	deleteNotification,
	getUserNotifications
} from '../Controller/notification.controller.js';

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
		'/',
		{
			preHandler: [app.authenticate],
			schema: {
				tags: ['Notifications']
			}
		},
		deleteAllNotifications
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
