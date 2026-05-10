import type { EquipItemResponse } from '@dinorpg/core/models/dinoz/dinozItems.js';
import type { IngredientFicheDTO } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import type { UseItemResult } from '@dinorpg/core/models/items/itemFeedback.js';
import type { ItemFicheDTO } from '@dinorpg/core/models/items/itemFiche.js';

import { api } from '../utils/http';

export const InventoryService = {
	getAllItemsData(): Promise<ItemFicheDTO[]> {
		return api.get<ItemFicheDTO[]>('/inventory/all/items');
	},
	getAllIngredientsData(): Promise<IngredientFicheDTO[]> {
		return api.get<IngredientFicheDTO[]>('/inventory/all/ingredients');
	},
	useInventoryItem(itemId: number, dinozId: number): Promise<UseItemResult> {
		return api.get<UseItemResult>(`/inventory/${dinozId}/${itemId}`);
	},
	equipInventoryItem(dinozId: number, itemId: number, equip: boolean): Promise<EquipItemResponse> {
		return api.put<EquipItemResponse>(`/inventory/equip/${dinozId}`, {
			itemId,
			equip
		});
	}
};
