import type { BankConversionResponse, BankExchangeRateResponse } from '@dinorpg/core/models/bank/bank.js';

import { api } from '../utils/http';

export const BankService = {
	getExchangeRate(): Promise<BankExchangeRateResponse> {
		return api.get('/bank/rate');
	},
	convertTreasureTickets(quantity: number): Promise<BankConversionResponse> {
		return api.post('/bank/treasure-tickets/convert', { quantity });
	}
};
