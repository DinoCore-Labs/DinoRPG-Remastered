import { expireDueMarketOffers } from '../../Market/Service/expireMarketOffers.service.js';

export async function expireDueMarketOffersJob(log: { info: Function; error: Function }): Promise<void> {
	const result = await expireDueMarketOffers();

	if (result.processed > 0) {
		log.info({ processed: result.processed }, '[jobs] market-offer-expiration processed');
	}
}
