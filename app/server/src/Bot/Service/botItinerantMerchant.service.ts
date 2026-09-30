import { ShopType } from '@dinorpg/core/models/enums/ShopType.js';
import { ItemShopType } from '@dinorpg/core/models/shop/shopFiche.js';
import { shopListV2 } from '@dinorpg/core/models/shop/shopListV2.js';

import { sellIngredientsToItinerantForUser } from '../../Shop/Service/sellIngredients.service.js';
import { prisma } from '../../prisma.js';
import { getBotIngredientReserve } from './botMarket.service.js';
import { getBotInventoryForecast } from './botInventoryForecast.service.js';

export type BotItinerantSale = {
	ingredients: Array<{
		itemId: number;
		quantity: number;
	}>;
	totalGold: number;
};

export async function getBotItinerantSalePlan(
	userId: string,
	shopId: number
): Promise<BotItinerantSale | null> {
	const shop = Object.values(shopListV2).find(entry => entry.shopId === shopId);
	if (!shop || shop.type !== ShopType.ITINERANT) return null;

	const [user, forecast] = await Promise.all([
		prisma.user.findUnique({
		where: { id: userId },
		select: {
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			}
		}
		}),
		getBotInventoryForecast(userId)
	]);
	if (!user) return null;

	const ingredients: BotItinerantSale['ingredients'] = [];
	let totalGold = 0;

	for (const sold of shop.listItemsSold) {
		if (sold.type !== ItemShopType.INGREDIENT) continue;

		const owned = user.ingredients.find(
			ingredient => ingredient.ingredientId === sold.id
		);
		if (!owned) continue;

		const reserve =
			getBotIngredientReserve(sold.id) +
			(forecast.ingredients.get(sold.id) ?? 0);
		const quantity = Math.max(0, owned.quantity - reserve);
		if (quantity <= 0) continue;

		ingredients.push({
			itemId: sold.id,
			quantity
		});
		totalGold += sold.price * quantity;
	}

	if (ingredients.length === 0) return null;

	return {
		ingredients,
		totalGold
	};
}

export async function sellBotSurplusToItinerant(
	userId: string,
	dinozId: number,
	shopId: number
): Promise<boolean> {
	const plan = await getBotItinerantSalePlan(userId, shopId);
	if (!plan) return false;

	await sellIngredientsToItinerantForUser(
		userId,
		dinozId,
		plan.ingredients
	);

	return true;
}
