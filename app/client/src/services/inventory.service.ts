import type { DinozItems } from '@dinorpg/core/models/dinoz/dinozItems.js';
import type { IngredientFicheDTO } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import type { ItemFeedBack } from '@dinorpg/core/models/items/itemFeedback.js';
import type { ItemFicheDTO } from '@dinorpg/core/models/items/itemFiche.js';

import { http } from '../utils/http';

export const InventoryService = {
	getAllItemsData(): Promise<Array<ItemFicheDTO>> {
		return http()
			.get('/inventory/all/items')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	getAllIngredientsData(): Promise<Array<IngredientFicheDTO>> {
		return http()
			.get('/inventory/all/ingredients')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async useInventoryItem(itemId: number, dinozId: number): Promise<ItemFeedBack> {
		return http()
			.get(`/inventory/${dinozId}/${itemId}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	equipInventoryItem(dinozId: number, itemId: number, equip: boolean): Promise<Array<DinozItems>> {
		return http()
			.put(`/inventory/equip/${dinozId}`, {
				itemId,
				equip
			})
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
