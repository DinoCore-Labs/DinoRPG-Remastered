import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { prisma } from '../../prisma.js';

export async function newNotif(userId: string, type: NotificationType, content?: any) {
	return prisma.notification.create({
		data: {
			userId,
			type,
			content: content || {}
		}
	});
}
