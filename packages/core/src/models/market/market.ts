export type MarketFilter = 'all' | 'dinoz' | 'items' | 'own' | 'bids';

export type MarketUser = {
	id: string;
	name: string;
};

export type MarketOfferItem = {
	id: number;
	itemId: number;
	quantity: number;
	isIngredient: boolean;
	name?: string;
};

export type MarketOfferDinoz = {
	id: number;
	name: string;
	display: string;
	level: number;
	raceId: number;
	nbrUpFire: number;
	nbrUpWater: number;
	nbrUpWood: number;
	nbrUpLightning: number;
	nbrUpAir: number;
	skills: { skillId: number }[];
	status: { statusId: number }[];
};

export type MarketOfferBid = {
	id?: number;
	value: number;
	userId?: string | null;
	userName?: string;
	user?: MarketUser | null;
};

export type MarketOffer = {
	id: number;
	sellerId: string | null;
	sellerName: string;
	endDate: string;
	dinozId: number | null;
	dinozDetails?: string | null;
	total: number;
	status: 'ONGOING' | 'ENDED' | 'CLAIMED';
	seller: MarketUser | null;
	dinoz: MarketOfferDinoz | null;
	items: MarketOfferItem[];
	bids: MarketOfferBid[];
};

export type EnhancedMarketOffer = Omit<MarketOffer, 'endDate'> & {
	endDate: Date;
};

export type MarketListResponse = {
	total: number;
	offers: MarketOffer[];
};
