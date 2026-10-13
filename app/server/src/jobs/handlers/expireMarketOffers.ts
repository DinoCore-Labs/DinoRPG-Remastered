import {
	expireDueMarketOffers,
	getNextMarketOfferExpirationDate
} from '../../Market/Service/expireMarketOffers.service.js';

export async function expireDueMarketOffersJob(log: { info: Function; error: Function }) {
	const result = await expireDueMarketOffers();
	const nextRunAt = await getNextMarketOfferExpirationDate();

	if (result.processed > 0) {
		log.info(
			{
				category: 'market',
				action: 'offers_expired',
				processed: result.processed,
				nextRunAt
			},
			'Market offers expired'
		);
	}

	return {
		nextRunAt
	};
}
