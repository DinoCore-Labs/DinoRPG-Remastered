import type { ThreadsBasic } from '@dinorpg/core/models/messaging/threadBasic.js';
import { defineStore } from 'pinia';

import { MessagerieService } from '../services/messaging.service';

export const messagingStore = defineStore('messagingStore', {
	state: () => ({
		unreadThreadsCount: 0,
		unreadPollingId: undefined as ReturnType<typeof window.setInterval> | undefined
	}),
	getters: {
		hasUnreadMessages: state => state.unreadThreadsCount > 0,

		unreadBadgeLabel: state => {
			if (state.unreadThreadsCount > 9) {
				return '9+';
			}
			return String(state.unreadThreadsCount);
		}
	},
	actions: {
		setUnreadThreadsFromThreads(threads: ThreadsBasic[]) {
			this.unreadThreadsCount = threads.filter(thread => thread.hasUnread).length;
		},
		async refreshUnreadThreads() {
			try {
				const threads = await MessagerieService.getThreads();

				this.setUnreadThreadsFromThreads(threads);
			} catch {
				// On garde l'ancien état pour éviter de faire disparaître la pastille
				// sur une simple erreur réseau temporaire.
			}
		},
		startUnreadPolling() {
			if (this.unreadPollingId) {
				return;
			}
			void this.refreshUnreadThreads();
			this.unreadPollingId = window.setInterval(() => {
				void this.refreshUnreadThreads();
			}, 60_000);
		},
		stopUnreadPolling() {
			if (!this.unreadPollingId) {
				return;
			}
			window.clearInterval(this.unreadPollingId);
			this.unreadPollingId = undefined;
		},
		clearUnreadThreads() {
			this.unreadThreadsCount = 0;
		}
	}
});
