import { ItemEffect } from '@dinorpg/core/models/enums/ItemEffect.js';
import { PlaceEnum } from '@dinorpg/core/models/enums/PlaceEnum.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';

import { OfferStatus } from '../../../../prisma/index.js';
import { createMarketOfferForUser } from '../../Market/Service/createMarketOffer.service.js';
import { prisma } from '../../prisma.js';
import { getBotInventoryForecast } from './botInventoryForecast.service.js';

const BOT_MARKET_MAX_LINES = 5;
const BOT_MARKET_MIN_VALUE = 1000;

type BotMarketOfferPlan = {
	total: number;
	items: Array<{ itemId: number; quantity: number }>;
	ingredients: Array<{ ingredientId: number; quantity: number }>;
};

function getItemReserve(itemId: number): number {
	const item = Object.values(itemList).find(entry => entry.itemId === itemId);
	if (!item) return Number.POSITIVE_INFINITY;
	if (item.sellable === false || !item.price) return Number.POSITIVE_INFINITY;
	if (item.effect?.category === ItemEffect.HEAL) return 3;
	if (item.isRare) return 1;
	if (item.canBeEquipped) return 2;
	return 1;
}

export function getBotIngredientReserve(ingredientId: number): number {
	const ingredient = Object.values(ingredientList).find(entry => entry.ingredientId === ingredientId);
	if (!ingredient) return Number.POSITIVE_INFINITY;
	if (ingredient.maxQuantity <= 5) return 2;
	if (ingredient.maxQuantity <= 20) return 5;
	return 10;
}

export async function getBotMarketOfferPlan(userId: string): Promise<BotMarketOfferPlan | null> {
	const [existingOffer, user, forecast] = await Promise.all([
		prisma.offer.findFirst({
			where: {
				sellerId: userId,
				status: OfferStatus.ONGOING
			},
			select: { id: true }
		}),
		prisma.user.findUnique({
			where: { id: userId },
			select: {
				items: {
					select: {
						itemId: true,
						quantity: true
					}
				},
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

	if (existingOffer || !user) return null;

	const candidates: Array<{
		type: 'item' | 'ingredient';
		id: number;
		quantity: number;
		unitValue: number;
		totalValue: number;
	}> = [];

	for (const owned of user.items) {
		const item = Object.values(itemList).find(entry => entry.itemId === owned.itemId);
		if (!item?.price || item.sellable === false) continue;

		const reserve = getItemReserve(owned.itemId) + (forecast.items.get(owned.itemId) ?? 0);
		const quantity = Math.max(0, owned.quantity - reserve);
		if (quantity <= 0) continue;

		candidates.push({
			type: 'item',
			id: owned.itemId,
			quantity,
			unitValue: item.price,
			totalValue: item.price * quantity
		});
	}

	for (const owned of user.ingredients) {
		const ingredient = Object.values(ingredientList).find(entry => entry.ingredientId === owned.ingredientId);
		if (!ingredient) continue;

		const reserve =
			getBotIngredientReserve(owned.ingredientId) +
			(forecast.ingredients.get(owned.ingredientId) ?? 0);
		const quantity = Math.max(0, owned.quantity - reserve);
		if (quantity <= 0) continue;

		candidates.push({
			type: 'ingredient',
			id: owned.ingredientId,
			quantity,
			unitValue: ingredient.price,
			totalValue: ingredient.price * quantity
		});
	}

	candidates.sort((a, b) => b.totalValue - a.totalValue);
	const selected = candidates.slice(0, BOT_MARKET_MAX_LINES);
	const total = selected.reduce((sum, candidate) => sum + candidate.totalValue, 0);
	if (total < BOT_MARKET_MIN_VALUE) return null;

	return {
		total,
		items: selected
			.filter(candidate => candidate.type === 'item')
			.map(candidate => ({
				itemId: candidate.id,
				quantity: candidate.quantity
			})),
		ingredients: selected
			.filter(candidate => candidate.type === 'ingredient')
			.map(candidate => ({
				ingredientId: candidate.id,
				quantity: candidate.quantity
			}))
	};
}

export async function createBotMarketOffer(userId: string): Promise<boolean> {
	const plan = await getBotMarketOfferPlan(userId);
	if (!plan) return false;

	await createMarketOfferForUser(userId, {
		total: plan.total,
		dinozId: null,
		items: plan.items,
		ingredients: plan.ingredients
	});

	return true;
}

export async function shouldBotGoToMarket(userId: string): Promise<boolean> {
	const plan = await getBotMarketOfferPlan(userId);
	if (!plan) return false;

	return prisma.dinoz
		.findFirst({
			where: {
				userId,
				placeId: PlaceEnum.PLACE_DU_MARCHE,
				life: { gt: 0 },
				state: null
			},
			select: { id: true }
		})
		.then(dinoz => !dinoz);
}
