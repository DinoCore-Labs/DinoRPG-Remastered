import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import type { DinozShopFicheLite } from '@dinorpg/core/models/shop/dinozShopFiche.js';
import type { ItemShopFiche, ShopDTO, ShopFeedBack } from '@dinorpg/core/models/shop/shopFiche.js';

import { api } from '../utils/http';

export const ShopService = {
	getDinozFromDinozShop(): Promise<DinozShopFicheLite[]> {
		return api.get<DinozShopFicheLite[]>('/shop/dinoz');
	},
	buyDinoz(id: number): Promise<DinozFiche> {
		return api.post<DinozFiche>(`/shop/dinoz/buydinoz/${id}`);
	},
	getItemsFromItemShop(shopId: number): Promise<ItemShopFiche[]> {
		return api.get<ItemShopFiche[]>(`/shop/getshop/${shopId}`);
	},
	buyItem(shopId: number, itemId: number, quantity: number): Promise<ShopFeedBack> {
		return api.put<ShopFeedBack>(`/shop/buyitem/${shopId}`, {
			itemId,
			quantity
		});
	},
	getIngredientsFromIngredientsShop(dinozId: number): Promise<IngredientFiche[]> {
		return api.get<IngredientFiche[]>(`/shop/getitinerantshop/${dinozId}`);
	},
	sellIngredient(dinozId: number, ingredients: ShopDTO[]): Promise<{ gold: number }> {
		return api.put<{ gold: number }>(`/shop/sellingredient/${dinozId}`, {
			ingredients
		});
	}
};
