import type { GatherPublicGrid } from '@dinorpg/core/models/gather/gatherPublicGrid.js';
import type { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';

import { http } from '../utils/http';

export const GatherService = {
	async getGatherGrid(dinozId: number, gridType: string): Promise<GatherPublicGrid> {
		return http()
			.get(`/gather/grid/${gridType}/${dinozId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				Promise.reject(err);
			});
	},
	async gatherWithDinoz(dinozId: number, gridType: string, box: number[][]): Promise<GatherResult> {
		return http()
			.put(`/gather/${dinozId}`, {
				type: gridType,
				box: box
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => {
				Promise.reject(err);
			});
	}
};
