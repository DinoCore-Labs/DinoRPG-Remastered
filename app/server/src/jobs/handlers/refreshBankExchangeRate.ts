import { refreshBankExchangeRate } from '../../Bank/Controller/bank.controller.js';

export async function refreshBankExchangeRateJob(log?: { info: Function }) {
	const rate = await refreshBankExchangeRate();
	log?.info?.(
		{
			rateBps: rate.rateBps,
			rate: rate.rate,
			goldPerTreasureTicket: rate.goldPerTreasureTicket
		},
		'[jobs] bank exchange rate refreshed'
	);
}
