import { FastifyInstance } from 'fastify';

import { itinerantDinozIdParamsSchema, shopDinozIdParamsSchema, shopIdParamsSchema } from '../Schema/shop.schema.js';
import { buyDinoz } from '../Service/buyDinoz.service.js';
import { buyItemHandler } from '../Service/buyItems.service.js';
import { getDinozFromDinozShop } from '../Service/getDinozFromDinozShop.service.js';
import { getIngredientsFromItinerantShop } from '../Service/getIngredientsFromItinerantShop.service.js';
import { getItemsFromShopHandler } from '../Service/getItemsFromShop.service.js';
import { sellIngredient } from '../Service/sellIngredients.service.js';

export async function shopRoutes(app: FastifyInstance) {
	// Shop Dinoz
	app.get('/dinoz', { preHandler: app.authenticate, schema: { tags: ['Shop'] } }, getDinozFromDinozShop);
	app.post(
		'/dinoz/buydinoz/:id',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Shop'],
				params: shopDinozIdParamsSchema
			}
		},
		buyDinoz
	);
	// Shop Items or Ingredients
	app.get(
		'/getshop/:shopId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Shop'],
				params: shopIdParamsSchema
			}
		},
		getItemsFromShopHandler
	);
	app.put(
		'/buyitem/:shopId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Shop'],
				params: shopIdParamsSchema
			}
		},
		buyItemHandler
	);
	// Itinerant Merchant
	app.get(
		'/getitinerantshop/:dinozId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Shop'],
				params: itinerantDinozIdParamsSchema
			}
		},
		getIngredientsFromItinerantShop
	);
	app.put(
		'/sellingredient/:dinozId',
		{
			preHandler: app.authenticate,
			schema: {
				tags: ['Shop'],
				params: itinerantDinozIdParamsSchema
			}
		},
		sellIngredient
	);
}
