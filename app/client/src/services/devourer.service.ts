import { api } from '../utils/http';

export interface DevourerDefenderDinoz {
	id: number;
	name: string;
	level: number;
	type: number;
	apparence: string;
}

export interface DevourerDefendersResponse {
	defenders: {
		userId: string;
		username: string;
		clanName: string | null;
		dinozs: DevourerDefenderDinoz[];
	} | null;
	attacksLeft: number;
}

export interface DevourerHistoryEntry {
	id: string;
	createdDate: string;
	result: boolean;
	leftUser: { id: string; name: string } | null;
	rightUser: { id: string; name: string } | null;
}

export interface DevourerHistoryResponse {
	fights: DevourerHistoryEntry[];
	total: number;
}

export const DevourerService = {
	getDefenders(placeId: number): Promise<DevourerDefendersResponse> {
		return api.get<DevourerDefendersResponse>(`/devourer/${placeId}`);
	},
	getHistory(placeId: number, page: number = 1): Promise<DevourerHistoryResponse> {
		return api.get<DevourerHistoryResponse>(`/devourer/${placeId}/history?page=${page}`);
	}
};

export default DevourerService;
