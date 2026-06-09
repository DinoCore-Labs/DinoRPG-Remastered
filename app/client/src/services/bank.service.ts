import type {
	BankConversionResponse,
	BankExchangeRateResponse,
	BankSavingsResponse,
	ClaimBankSavingResponse,
	CreateBankSavingResponse
} from '@dinorpg/core/models/bank/bank.js';

import { api } from '../utils/http';

export const BankService = {
	getExchangeRate(): Promise<BankExchangeRateResponse> {
		return api.get('/bank/rate');
	},
	convertTreasureTickets(quantity: number): Promise<BankConversionResponse> {
		return api.post('/bank/treasure-tickets/convert', { quantity });
	},
	getSavings(): Promise<BankSavingsResponse> {
		return api.get('/bank/savings');
	},
	createSaving(amount: number, durationDays: number): Promise<CreateBankSavingResponse> {
		return api.post('/bank/savings', {
			amount,
			durationDays
		});
	},
	claimSaving(id: string): Promise<ClaimBankSavingResponse> {
		return api.post(`/bank/savings/${id}/claim`);
	}
};
