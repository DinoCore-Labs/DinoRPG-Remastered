import { api } from '../utils/http';

type ActionResponse = { message: string };

export const AdminEventService = {
	publishStartNews(eventId: string): Promise<ActionResponse> {
		return api.post<ActionResponse>(`/admin/events/${eventId}/news/start`);
	},
	publishEndNews(eventId: string): Promise<ActionResponse> {
		return api.post<ActionResponse>(`/admin/events/${eventId}/news/end`);
	},
	resetScores(eventId: string): Promise<ActionResponse> {
		return api.post<ActionResponse>(`/admin/events/${eventId}/scores/reset`);
	},
	distributeRewards(eventId: string): Promise<ActionResponse> {
		return api.post<ActionResponse>(`/admin/events/${eventId}/rewards/distribute`);
	}
};
