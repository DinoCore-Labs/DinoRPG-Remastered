import type { FightResult } from '@dinorpg/core/models/fight/fightResult.js';

import { http } from '../utils/http';

export const FightService = {
	async processFight(dinozId: number): Promise<FightResult> {
		return http()
			.put('/fight/:id', {
				dinozId
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				Promise.reject(err);
			});
	}
};
