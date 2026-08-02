import { api } from '../utils/http';

export interface DevoreuseDefenderDinoz {
	id: number;
	name: string;
	level: number;
	type: number;
	apparence: string;
}

export interface DevoreuseDefendersResponse {
	defenders: {
		userId: string;
		username: string;
		clanName: string | null;
		dinozs: DevoreuseDefenderDinoz[];
	} | null;
	attacksLeft: number;
}

export const DevoreuseService = {
	getDefenders(placeId: number): Promise<DevoreuseDefendersResponse> {
		return api.get<DevoreuseDefendersResponse>(`/devoreuse/${placeId}`);
	}
};

export default DevoreuseService;
