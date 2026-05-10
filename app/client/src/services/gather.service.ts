import type { GatherPublicGrid } from '@dinorpg/core/models/gather/gatherPublicGrid.js';
import type { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';

import { api } from '../utils/http';

export const GatherService = {
	getGatherGrid(dinozId: number, gridType: string): Promise<GatherPublicGrid> {
		return api.get<GatherPublicGrid>(`/gather/grid/${gridType}/${dinozId}`);
	},
	gatherWithDinoz(dinozId: number, gridType: string, box: number[][]): Promise<GatherResult> {
		return api.put<GatherResult>(`/gather/${dinozId}`, {
			type: gridType,
			box
		});
	}
};
