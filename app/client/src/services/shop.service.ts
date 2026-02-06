import type { DinozFiche } from '@dinorpg/core/models/dinoz/dinozFiche.js';
import type { DinozShopFicheLite } from '@dinorpg/core/models/shop/dinozShopFiche.js';

import { http } from '../utils/http';

export const ShopService = {
	async getDinozFromDinozShop(): Promise<DinozShopFicheLite[]> {
		return http()
			.get('shop/dinoz')
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	},
	async buyDinoz(id: number): Promise<DinozFiche> {
		return http()
			.post(`shop/dinoz/buydinoz/${id}`)
			.then(res => Promise.resolve(res.data))
			.catch(err => Promise.reject(err));
	}
};
