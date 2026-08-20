import { FastifyReply, FastifyRequest } from 'fastify';

import { prisma } from '../../prisma.js';

export async function getUserNotifications(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		if (!userId) {
			return reply.code(401).send({ message: 'Authentication required' });
		}

		const notifications = await prisma.notification.findMany({
			where: { userId }
		});

		return reply.send(notifications);
	} catch (err) {
		req.log.error(err);
		return reply.code(500).send({ message: 'Internal Server Error' });
	}
}

export async function deleteNotification(req: FastifyRequest, reply: FastifyReply) {
	try {
		const userId = req.user.id;
		if (!userId) {
			return reply.code(401).send({ message: 'Authentication required' });
		}

		const { id } = req.params as { id: string };

		// Verify the notification belongs to this user before deleting
		const notification = await prisma.notification.findFirst({
			where: { id, userId }
		});

		if (!notification) {
			return reply.code(404).send({ message: 'Notification not found' });
		}

		await prisma.notification.delete({
			where: { id }
		});

		return reply.send({ message: 'Notification deleted successfully' });
	} catch (err) {
		req.log.error(err);
		return reply.code(500).send({ message: 'Internal Server Error' });
	}
}
