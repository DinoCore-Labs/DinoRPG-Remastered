import type { FastifyInstance } from 'fastify';

import {
	claimBankSavingParamsSchema,
	convertTreasureTicketsBodySchema,
	createBankSavingBodySchema
} from '../Schema/bank.schema.js';
import { convertTreasureTicketsController, getBankExchangeRateController } from '../Service/bank.service.js';
import {
	claimBankSavingController,
	createBankSavingController,
	getBankSavingsController
} from '../Service/bankSaving.service.js';

export async function bankRoutes(app: FastifyInstance) {
	app.get(
		'/rate',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank']
			}
		},
		getBankExchangeRateController
	);
	app.post(
		'/treasure-tickets/convert',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank'],
				body: convertTreasureTicketsBodySchema
			}
		},
		convertTreasureTicketsController
	);
	app.get(
		'/savings',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank']
			}
		},
		getBankSavingsController
	);
	app.post(
		'/savings',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank'],
				body: createBankSavingBodySchema
			}
		},
		createBankSavingController
	);
	app.post(
		'/savings/:id/claim',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Bank'],
				params: claimBankSavingParamsSchema
			}
		},
		claimBankSavingController
	);
}
