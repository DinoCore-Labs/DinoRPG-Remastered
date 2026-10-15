import { defaultConditionKeyMaps } from '@dinorpg/core/models/conditions/defaultConditionKeyMaps.js';
import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';
import { FastifyRequest } from 'fastify';

import { GameLogType } from '../../../../prisma/index.js';
import { getDinozFromItinerantShop } from '../../Dinoz/Controller/getDinozFromItinerantShop.controller.js';
import { safeCreateGameLog } from '../../Gamelog/Controller/gamelog.controller.js';
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

type SellIngredientsOptions = {
	log?: {
		error: Function;
		info?: Function;
	};
	requestId?: string;
};

const normalizeIngredientsToSell = (ingredients: SellIngredientBody['ingredients']) => {
	const quantitiesByItemId = new Map<number, number>();

	for (const ingredient of ingredients) {
		if (
			!Number.isInteger(ingredient.itemId) ||
			!Number.isInteger(ingredient.quantity) ||
			ingredient.itemId <= 0 ||
			ingredient.quantity <= 0
		) {
			throw new ExpectedError('wrongQuantity');
		}

		const currentQuantity = quantitiesByItemId.get(ingredient.itemId) ?? 0;

		const nextQuantity = currentQuantity + ingredient.quantity;

		if (!Number.isSafeInteger(nextQuantity)) {
			throw new ExpectedError('wrongQuantity');
		}

		quantitiesByItemId.set(ingredient.itemId, nextQuantity);
	}

	return Array.from(quantitiesByItemId.entries()).map(([itemId, quantity]) => ({
		itemId,
		quantity
	}));
};

export async function sellIngredientsToItinerantForUser(
	userId: string,
	dinozId: number,
	input: SellIngredientBody['ingredients'],
	options: SellIngredientsOptions = {}
): Promise<{ gold: number }> {
	const ingredients = normalizeIngredientsToSell(input);

	const playerIngredients = await getUserIngredientDataRequest(userId);

	if (!playerIngredients) {
		throw new ExpectedError(`Player ${userId} doesn't exist.`);
	}

	if (ingredients.some(ingredient => ingredient.quantity <= 0)) {
		throw new ExpectedError('wrongQuantity');
	}

	const player = await getDinozFromItinerantShop(dinozId, userId);

	if (!player) {
		throw new ExpectedError(`Player ${userId} doesn't exist`);
	}

	const itinerant = await getSpecificSecret('itinerant');

	if (!itinerant) {
		throw new ExpectedError(`No itinerant merchant place found.`);
	}

	const conditionContext = buildConditionContext(player, dinozId, defaultConditionKeyMaps);

	const itinerantShop = Object.values(shopListV2)
		.filter(shop => shop.type === ShopType.ITINERANT)
		.find(shop => checkCondition(shop.condition, conditionContext));

	if (!itinerantShop || !player.dinoz.some(dinoz => dinoz.placeId === Number(itinerant.value))) {
		throw new ExpectedError(`This dinoz cannot access itinerant shop`);
	}

	if (itinerantShop.type !== ShopType.ITINERANT) {
		throw new ExpectedError(`Wrong shop returned`);
	}

	const mappedIngredient = ingredients.map(ingredient => {
		const playerQuantity = player.ingredients.find(entry => entry.ingredientId === ingredient.itemId);

		const itemToMap = itinerantShop.listItemsSold.find(item => item.id === ingredient.itemId);

		if (!playerQuantity || !itemToMap) {
			throw new ExpectedError(`Player doesn't have this item in stock.`);
		}

		return {
			...itemToMap,
			quantity: ingredient.quantity,
			playerQuantity: playerQuantity.quantity
		};
	});

	let gold = 0;

	const soldIngredients: Array<{
		ingredientId: number;
		quantity: number;
		unitPrice: number;
		totalGold: number;
	}> = [];

	for (const ingredient of mappedIngredient) {
		if (!ingredient.id || !ingredient.price) {
			throw new ExpectedError(`Undefined ingredient`);
		}

		if (ingredient.playerQuantity - ingredient.quantity < 0) {
			throw new ExpectedError(`You cannot have less than 0 of this item.`);
		}

		const totalGold = ingredient.price * ingredient.quantity;

		gold += totalGold;

		soldIngredients.push({
			ingredientId: ingredient.id,
			quantity: ingredient.quantity,
			unitPrice: ingredient.price,
			totalGold
		});

		await decreaseIngredientQuantity(userId, ingredient.id, ingredient.quantity);
	}

	const updated = await addMoney(userId, gold);

	for (const sold of soldIngredients) {
		safeCreateGameLog(
			{
				type: GameLogType.IngredientSold,
				userId,
				dinozId,
				values: [String(sold.quantity), String(sold.ingredientId), String(sold.totalGold)],
				metadata: {
					ingredientId: sold.ingredientId,
					quantity: sold.quantity,
					unitPrice: sold.unitPrice,
					totalGold: sold.totalGold,
					shopType: itinerantShop.type,
					reason: 'ITINERANT_SHOP_SELL'
				}
			},
			options.log
		);
	}

	options.log?.info?.(
		{
			category: 'economy',
			action: 'ingredients_sold',
			userId,
			dinozId,
			shopId: itinerantShop.shopId,
			ingredientTypes: soldIngredients.length,
			goldReceived: gold,
			requestId: options.requestId
		},
		'Ingredients sold to itinerant merchant'
	);

	return {
		gold: updated.amount
	};
}

export async function sellIngredient(
	req: FastifyRequest<{
		Params: DinozParams;
		Body: SellIngredientBody;
	}>
): Promise<{ gold: number }> {
	return sellIngredientsToItinerantForUser(req.user.id, Number(req.params.dinozId), req.body.ingredients, {
		log: req.log,
		requestId: req.id
	});
}
