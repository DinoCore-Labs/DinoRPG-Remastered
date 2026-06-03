export interface BankExchangeRateResponse {
	rateBps: number;
	rate: number;
	goldPerTreasureTicket: number;
}

export interface BankConversionResponse {
	quantity: number;
	rate: number;
	rateBps: number;
	goldPerTreasureTicket: number;
	goldAdded: number;
	wallets: {
		gold: number;
		treasureTicket: number;
	};
}
