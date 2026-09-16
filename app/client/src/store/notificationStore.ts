import { defineStore } from 'pinia';

import { type NotificationItem, NotificationService } from '../services/notification.service';

export const notificationStore = defineStore('notificationStore', {
	state: () => ({
		notifications: [] as NotificationItem[],
		pollingId: undefined as ReturnType<typeof window.setInterval> | undefined
	}),
	getters: {
		hasNotifications: state => state.notifications.length > 0,
		notificationCount: state => state.notifications.length,
		badgeLabel: state => {
			const count = state.notifications.length;
			if (count > 9) {
				return '9+';
			}
			return String(count);
		}
	},
	actions: {
		async refreshNotifications(): Promise<void> {
			try {
				this.notifications = await NotificationService.getNotifications();
			} catch {
				/*
				 * Une erreur réseau temporaire ne doit pas
				 * faire disparaître une pastille existante.
				 */
			}
		},
		async deleteNotification(id: string): Promise<void> {
			await NotificationService.deleteNotification(id);
			this.notifications = this.notifications.filter(notification => notification.id !== id);
		},
		startPolling(): void {
			if (this.pollingId) {
				return;
			}
			void this.refreshNotifications();
			this.pollingId = window.setInterval(() => {
				void this.refreshNotifications();
			}, 60_000);
		},
		stopPolling(): void {
			if (!this.pollingId) {
				return;
			}
			window.clearInterval(this.pollingId);
			this.pollingId = undefined;
		},
		clear(): void {
			this.notifications = [];
		}
	}
});
