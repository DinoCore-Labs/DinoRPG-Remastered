import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import type { EnhancedMarketOffer, MarketOffer } from '@dinorpg/core/models/market/market.js';

export const MARKET_MIN_VALUE = 1_000;
export const MARKET_MAX_ITEMS = 5;
export const MARKET_PAGE_SIZE = 10;

export function secondsToDhms(seconds: number) {
	const safeSeconds = Math.max(0, seconds);

	const days = Math.floor(safeSeconds / 86400);
	const hours = Math.floor((safeSeconds % 86400) / 3600);
	const minutes = Math.floor((safeSeconds % 3600) / 60);
	const secs = safeSeconds % 60;

	return {
		days,
		hours,
		minutes,
		seconds: secs
	};
}

export function formatMarketTime(seconds: number) {
	const { days, hours, minutes, seconds: secs } = secondsToDhms(seconds);

	if (days > 0) return `${days}j ${hours}h`;
	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m ${secs}s`;

	return `${secs}s`;
}

export function formatMarketOffers(offers: MarketOffer[]): EnhancedMarketOffer[] {
	return offers.map(offer => ({
		...offer,
		endDate: new Date(offer.endDate),
		items: offer.items.map(item => ({
			...item,
			name: item.isIngredient
				? ingredientList[item.itemId as keyof typeof ingredientList]?.name
				: itemList[item.itemId as keyof typeof itemList]?.name
		}))
	}));
}

export function getOfferMinimumBid(offer: EnhancedMarketOffer) {
	return Math.max(Math.ceil(offer.total / 1000), offer.bids[0]?.value ? offer.bids[0].value + 1 : 0);
}

export function isOfferExpired(offer: EnhancedMarketOffer, now: number) {
	return Math.ceil(offer.endDate.getTime() / 1000) <= now || offer.status !== 'ONGOING';
}
