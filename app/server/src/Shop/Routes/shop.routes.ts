import { FastifyInstance } from 'fastify';

import { buyDinoz } from '../Service/buyDinoz.service.js';
import { buyItemHandler } from '../Service/buyItems.service.js';
import { getDinozFromDinozShop } from '../Service/getDinozFromDinozShop.service.js';
import { getIngredientsFromItinerantShop } from '../Service/getIngredientsFromItinerantShop.service.js';
import { getItemsFromShopHandler } from '../Service/getItemsFromShop.service.js';
import { sellIngredient } from '../Service/sellIngredients.service.js';

export async function shopRoutes(app: FastifyInstance) {
	// Shop Dinoz
	app.get('/dinoz', { preHandler: app.authenticate }, getDinozFromDinozShop);
	app.post(
		'/dinoz/buydinoz/:id',
		{
			preHandler: app.authenticate,
			schema: {
				params: {
					type: 'object',
					required: ['id'],
					properties: {
						id: {
							type: 'number'
						}
					}
				}
			}
		},
		buyDinoz
	);
	// Shop Items or Ingredients
	app.get('/getshop/:shopId', { preHandler: app.authenticate }, getItemsFromShopHandler);
	app.put('/buyitem/:shopId', { preHandler: app.authenticate }, buyItemHandler);
	// Itinerant Merchant
	app.get('/getitinerantshop/:dinozId', { preHandler: app.authenticate }, getIngredientsFromItinerantShop);
	app.put('/sellingredient/:dinozId', { preHandler: app.authenticate }, sellIngredient);
}
