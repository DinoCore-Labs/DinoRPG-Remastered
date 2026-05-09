import type { MarketFilter, MarketListResponse } from '@dinorpg/core/models/market/market.js';

import { http } from '../utils/http';

export const MarketService = {
	getList(
		filter: MarketFilter = 'all',
		sellerId: string | null = null,
		bidderId: string | null = null,
		expired = false,
		page = 1,
		onlyMines = false
	): Promise<MarketListResponse> {
		const apiFilter = filter === 'bids' ? 'all' : filter;
		return http()
			.get<MarketListResponse>(`/market/list/${apiFilter}`, {
				params: {
					page,
					...(expired ? { expired } : {}),
					...(onlyMines ? { onlyMines } : {}),
					...(sellerId ? { sellerId } : {}),
					...(bidderId ? { bidderId } : {})
				}
			})
			.then(res => res.data);
	},
	createOffer(payload: {
		total: number;
		dinozId?: number | null;
		items: { itemId: number; quantity: number }[];
		ingredients: { ingredientId: number; quantity: number }[];
	}) {
		return http()
			.put('/market', payload)
			.then(res => res.data);
	},
	bidOffer(offerId: number, value: number) {
		return http()
			.post(`/market/${offerId}/bid`, { value })
			.then(res => res.data);
	},
	cancelOffer(offerId: number) {
		return http()
			.delete(`/market/${offerId}`)
			.then(res => res.data);
	},
	claimOffer(offerId: number) {
		return http()
			.post(`/market/${offerId}/claim`)
			.then(res => res.data);
	}
};
