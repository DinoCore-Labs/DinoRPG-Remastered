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

export const DevourerService = {
	getDefenders(placeId: number): Promise<DevourerDefendersResponse> {
		return api.get<DevourerDefendersResponse>(`/devourer/${placeId}`);
	}
};

export default DevourerService;
