import type { DinozShopFicheLite } from '@dinorpg/core/models/shop/dinozShopFiche.js';

import { http } from '../utils/http';

export const ShopService = {
	async getDinozFromDinozShop(): Promise<DinozShopFicheLite[]> {
		return http()
			.get('shop/dinoz')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
