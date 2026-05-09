import {
	expireDueMarketOffers,
	getNextMarketOfferExpirationDate
} from '../../Market/Service/expireMarketOffers.service.js';

export async function expireDueMarketOffersJob(log: { info: Function; error: Function }) {
	const result = await expireDueMarketOffers();
	const nextRunAt = await getNextMarketOfferExpirationDate();

	if (result.processed > 0) {
		log.info({ processed: result.processed, nextRunAt }, '[jobs] market-offer-expiration processed');
	}

	return {
		nextRunAt
	};
}
