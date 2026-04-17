import type { FullThread, PaginatedThreadMessages, ThreadsBasic } from '@dinorpg/core/models/messaging/threadBasic.js';

import { http } from '../utils/http';

export const MessagerieService = {
	async getThreads(): Promise<ThreadsBasic[]> {
		return http()
			.get('/messaging/threads')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async getThread(threadId: string): Promise<FullThread> {
		return http()
			.get(`/messaging/threads/${threadId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async loadMessages(threadId: string, page: number): Promise<PaginatedThreadMessages> {
		return http()
			.get(`/messaging/threads/${threadId}/messages`, {
				params: { page }
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async createThread(
		participantIds: Array<string> | undefined,
		title: string | undefined,
		message: string
	): Promise<ThreadsBasic> {
		return http()
			.post('/messaging/threads', {
				participantIds: participantIds ?? [],
				title,
				message
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async answerThread(threadId: string, message: string): Promise<FullThread> {
		return http()
			.post(`/messaging/threads/${threadId}/messages`, {
				message
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
