import type { ItemFicheDTO } from '@dinorpg/core/models/items/itemFiche.js';

import { http } from '../utils/http';

export const InventoryService = {
	getAllItemsData(): Promise<Array<ItemFicheDTO>> {
		return http()
			.get('/inventory/all')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
