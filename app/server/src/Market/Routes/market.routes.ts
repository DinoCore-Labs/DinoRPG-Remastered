import type { FastifyInstance } from 'fastify';

import {
	bidOfferBodySchema,
	createMarketOfferBodySchema,
	marketListParamsSchema,
	marketListQuerySchema,
	offerIdParamsSchema
} from '../Schema/market.schema.js';
import { bidMarketOffer } from '../Service/bidMarketOffer.service.js';
import { cancelMarketOffer } from '../Service/cancelMarketOffer.service.js';
import { claimMarketOffer } from '../Service/claimMarketOffer.service.js';
import { createMarketOffer } from '../Service/createMarketOffer.service.js';
import { listMarketOffers } from '../Service/listMarketOffers.service.js';

export async function marketRoutes(app: FastifyInstance) {
	app.get(
		'/list/:filter',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Market'],
				params: marketListParamsSchema,
				querystring: marketListQuerySchema
			}
		},
		listMarketOffers
	);

	app.put(
		'/',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Market'],
				body: createMarketOfferBodySchema
			}
		},
		createMarketOffer
	);

	app.delete(
		'/:offerId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Market'],
				params: offerIdParamsSchema
			}
		},
		cancelMarketOffer
	);

	app.post(
		'/:offerId/bid',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Market'],
				params: offerIdParamsSchema,
				body: bidOfferBodySchema
			}
		},
		bidMarketOffer
	);

	app.post(
		'/:offerId/claim',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Market'],
				params: offerIdParamsSchema
			}
		},
		claimMarketOffer
	);
}
