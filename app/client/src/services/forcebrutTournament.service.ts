import type { ForcebrutOpponent } from '@dinorpg/core/models/forcebrut/forcebrutOpponent.js';
import type { ForcebrutFightResponse } from '@dinorpg/core/models/forcebrut/forcebrutResponse.js';

import { api } from '../utils/http';

export const ForcebrutService = {
	getOpponent(dinozId: number): Promise<ForcebrutOpponent> {
		return api.get<ForcebrutOpponent>(`/forcebrutTournament/opponent/${dinozId}`);
	},

	fight(dinozId: number): Promise<ForcebrutFightResponse> {
		return api.post<ForcebrutFightResponse>(`/forcebrutTournament/fight/${dinozId}`);
	}
};
