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

export interface BankSavingPlanResponse {
	durationDays: number;
	interestRateBps: number;
	interestRate: number;
}

export interface BankSavingResponse {
	id: string;
	amount: number;
	durationDays: number;
	interestRateBps: number;
	interestRate: number;
	interestGold: number;
	totalGold: number;
	unlockAt: string;
	claimedAt: string | null;
	createdAt: string;
	canClaim: boolean;
}

export interface BankSavingsResponse {
	plans: BankSavingPlanResponse[];
	savings: BankSavingResponse[];
}

export interface CreateBankSavingResponse {
	saving: BankSavingResponse;
	wallets: {
		gold: number;
	};
}

export interface ClaimBankSavingResponse {
	saving: BankSavingResponse;
	wallets: {
		gold: number;
	};
}
