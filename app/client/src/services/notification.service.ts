import { NotificationType } from '@dinorpg/core/models/notif/notifType.js';

import { api } from '../utils/http';

export interface NotificationItem {
	id: string;
	userId: string;
	type: NotificationType;
	content?: any;
}

export const NotificationService = {
	getNotifications(): Promise<NotificationItem[]> {
		return api.get<NotificationItem[]>('/notifications');
	},
	deleteNotification(id: string): Promise<{ message: string }> {
		return api.delete<{ message: string }>(`/notifications/${id}`);
	}
};
