import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyRequest } from 'fastify';

import { getDinozFromItinerantShop } from '../../Dinoz/Controller/getDinozFromItinerantShop.controller.js';
import { decreaseIngredientQuantity } from '../../Inventory/Controller/addIngredient.controller.js';
import { getUserIngredientDataRequest } from '../../Inventory/Controller/getUserIngredient.controller.js';
import { getSpecificSecret } from '../../jobs/controller/getSpecificSecret.js';
import { addMoney } from '../../User/Controller/money.controller.js';
import { buildConditionContext } from '../../utils/conditions/buildConditionContext.js';
import { checkCondition } from '../../utils/conditions/checkCondition.js';

type DinozParams = {
	dinozId: string;
};

type SellIngredientBody = {
	ingredients: Array<{
		itemId: number;
		quantity: number;
	}>;
};

export async function sellIngredient(
	req: FastifyRequest<{ Params: DinozParams; Body: SellIngredientBody }>
): Promise<{ gold: number }> {
	const authed = req.user;

	const dinozId = Number(req.params.dinozId);
	const ingredients = req.body.ingredients;

	const playerIngredients = await getUserIngredientDataRequest(authed.id);
	if (!playerIngredients) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist.`);
	}

	// Lock negative / zero quantities
	if (ingredients.some(i => i.quantity <= 0)) {
		throw new ExpectedError('wrongQuantity');
	}

	const player = await getDinozFromItinerantShop(dinozId, authed.id);
	if (!player) {
		throw new ExpectedError(`Player ${authed.id} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');
	if (!itinerant) throw new ExpectedError(`No itinerant merchant place found.`);

	const conditionContext = buildConditionContext(player, dinozId, defaultConditionKeyMaps);

	const itinerantShop = Object.values(shopListV2)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(shop => checkCondition(shop.condition, conditionContext));

	if (!itinerantShop || !player.dinoz.some(d => d.placeId === Number(itinerant.value))) {
		throw new ExpectedError(`This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ExpectedError(`Wrong shop returned`);
	}

	// Validate all ingredients + map
	const mappedIngredient = ingredients.map(i => {
		const playerQuantity = player.ingredients.find(ing => ing.ingredientId === i.itemId);
		const itemToMap = itinerantShop.listItemsSold.find(a => a.id === i.itemId);

		if (!playerQuantity || !itemToMap) {
			throw new ExpectedError(`Player doesn't have this item in stock.`);
		}

		return {
			...itemToMap,
			quantity: i.quantity,
			playerQuantity: playerQuantity.quantity
		};
	});

	let gold = 0;

	for (const ingre of mappedIngredient) {
		if (!ingre.id || !ingre.price) throw new ExpectedError(`Undefined ingredient`);
		if (ingre.playerQuantity - ingre.quantity < 0) {
			throw new ExpectedError(`You cannot have less than 0 of this item.`);
		}

		gold += ingre.price * ingre.quantity;

		await decreaseIngredientQuantity(authed.id, ingre.id, ingre.quantity);
	}

	const updated = await addMoney(authed.id, gold);
	return { gold: updated.amount };
}
