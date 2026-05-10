import type { FullThread, PaginatedThreadMessages, ThreadsBasic } from '@dinorpg/core/models/messaging/threadBasic.js';

import { api } from '../utils/http';

export const MessagerieService = {
	getThreads(options?: { silent?: boolean }): Promise<ThreadsBasic[]> {
		return api.get('/messaging/threads', {
			silent: options?.silent ?? false
		});
	},
	getThread(threadId: string): Promise<FullThread> {
		return api.get<FullThread>(`/messaging/threads/${threadId}`);
	},
	loadMessages(threadId: string, page: number): Promise<PaginatedThreadMessages> {
		return api.get<PaginatedThreadMessages>(`/messaging/threads/${threadId}/messages`, {
			params: { page }
		});
	},
	createThread(
		participantIds: string[] | undefined,
		title: string | undefined,
		message: string
	): Promise<ThreadsBasic> {
		return api.post<ThreadsBasic>('/messaging/threads', {
			participantIds: participantIds ?? [],
			title,
			message
		});
	},
	answerThread(threadId: string, message: string): Promise<FullThread> {
		return api.post<FullThread>(`/messaging/threads/${threadId}/messages`, {
			message
		});
	}
};
