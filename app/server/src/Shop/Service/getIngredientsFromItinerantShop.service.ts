import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { IngredientFiche } from '@dinorpg/core/models/ingredients/ingredientFiche.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { shopList } from '@dinorpg/core/models/shop/shopList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyRequest } from 'fastify';

import { getDinozFromItinerantShop } from '../../Dinoz/Controller/getDinozFromItinerantShop.controller.js';
import { getSpecificSecret } from '../../jobs/controller/getSpecificSecret.js';
import { checkCondition } from '../../utils/checkCondition.js';

type DinozParams = {
	dinozId: string;
};

export async function getIngredientsFromItinerantShop(
	req: FastifyRequest<{ Params: DinozParams }>
): Promise<IngredientFiche[]> {
	const authed = req.user;

	const playerId = authed.id;
	const dinozId = Number(req.params.dinozId);

	const player = await getDinozFromItinerantShop(dinozId, playerId);
	if (!player) {
		throw new ExpectedError(`Player ${playerId} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);

	const itinerantShop = Object.values(shopList)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(s => checkCondition(s.condition, player, dinozId));

	// shop accessible + dinoz sur le bon placeId
	if (!itinerantShop || !player.dinoz.some(d => d.placeId === Number(itinerant.value))) {
		throw new ExpectedError(`This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ExpectedError(`Wrong shop returned`);
	}

	return itinerantShop.listItemsSold.map(ingBuy => {
		const ingredientPlayer = player.ingredients.find(playerIng => playerIng.ingredientId === ingBuy.id);
		const ingredientReference = Object.values(ingredientList).find(ing => ing.ingredientId === ingBuy.id);

		if (!ingredientReference) {
			throw new ExpectedError(`Ingredient ${ingBuy.id} doesn't exist`);
		}

		if (!ingBuy.price) {
			throw new ExpectedError(`Ingredient ${ingBuy.id} doesn't have a price`);
		}

		return {
			name: ingredientReference.name,
			ingredientId: ingredientReference.ingredientId,
			price: ingredientReference.price,
			quantity: ingredientPlayer ? ingredientPlayer.quantity : 0,
			maxQuantity: ingredientReference.maxQuantity
		};
	});
}
