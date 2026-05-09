import { ItemType } from '@dinorpg/core/models/enums/ItemType.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import { DinozState, Prisma } from '../../../../prisma/index.js';
import { getUserMaxDinoz } from '../../Dinoz/Controller/getActiveDinoz.js';
import { prisma } from '../../prisma.js';

type MarketItem = {
	itemId: number;
	quantity: number;
};

type MarketIngredient = {
	ingredientId: number;
	quantity: number;
};

export function assertItemIsSellable(itemId: number) {
	const item = Object.values(itemList).find(i => i.itemId === itemId);

	if (!item) {
		throw new ExpectedError(`Item ${itemId} does not exist`);
	}

	if (item.sellable === false) {
		throw new ExpectedError('itemNotSellable');
	}
}

export function assertIngredientExists(ingredientId: number) {
	const ingredient = Object.values(ingredientList).find(i => i.ingredientId === ingredientId);

	if (!ingredient) {
		throw new ExpectedError(`Ingredient ${ingredientId} does not exist`);
	}
}

function getItemMaxQuantity(shopKeeper: boolean, itemId: number) {
	const item = Object.values(itemList).find(i => i.itemId === itemId);

	if (!item) {
		throw new ExpectedError(`Item ${itemId} does not exist`);
	}

	if (shopKeeper && item.itemType !== ItemType.MAGICAL) {
		return Math.round(item.maxQuantity * 1.5);
	}

	return item.maxQuantity;
}

function getIngredientMaxQuantity(shopKeeper: boolean, ingredientId: number) {
	const ingredient = Object.values(ingredientList).find(i => i.ingredientId === ingredientId);

	if (!ingredient) {
		throw new ExpectedError(`Ingredient ${ingredientId} does not exist`);
	}

	return shopKeeper ? Math.round(ingredient.maxQuantity * 1.5) : ingredient.maxQuantity;
}

export async function assertUserOwnsOfferContent(userId: string, items: MarketItem[], ingredients: MarketIngredient[]) {
	const user = await prisma.user.findUniqueOrThrow({
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
	});

	for (const item of items) {
		assertItemIsSellable(item.itemId);

		const owned = user.items.find(i => i.itemId === item.itemId)?.quantity ?? 0;

		if (owned < item.quantity) {
			throw new ExpectedError('notEnoughItems');
		}
	}

	for (const ingredient of ingredients) {
		assertIngredientExists(ingredient.ingredientId);

		const owned = user.ingredients.find(i => i.ingredientId === ingredient.ingredientId)?.quantity ?? 0;

		if (owned < ingredient.quantity) {
			throw new ExpectedError('notEnoughIngredients');
		}
	}
}

export async function assertUserCanReceiveOfferContent(
	userId: string,
	input: {
		items: MarketItem[];
		ingredients: MarketIngredient[];
		dinozId?: number | null;
		originalOwnerId?: string | null;
	}
) {
	const user = await prisma.user.findUniqueOrThrow({
		where: { id: userId },
		select: {
			id: true,
			shopKeeper: true,
			leader: true,
			messie: true,
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
			},
			_count: {
				select: {
					dinoz: {
						where: {
							OR: [
								{ state: null },
								{
									state: {
										not: {
											in: [DinozState.frozen, DinozState.sacrificed]
										}
									}
								}
							]
						}
					}
				}
			}
		}
	});

	if (input.dinozId) {
		const ownSellingDinozBonus = input.originalOwnerId === userId ? 1 : 0;
		const maxDinoz = getUserMaxDinoz(user);

		if (user._count.dinoz + 1 > maxDinoz + ownSellingDinozBonus) {
			throw new ExpectedError('tooMuchDinoz');
		}
	}

	for (const item of input.items) {
		const current = user.items.find(i => i.itemId === item.itemId)?.quantity ?? 0;
		const max = getItemMaxQuantity(user.shopKeeper, item.itemId);

		if (current + item.quantity > max) {
			throw new ExpectedError('tooMuchItem');
		}
	}

	for (const ingredient of input.ingredients) {
		const current = user.ingredients.find(i => i.ingredientId === ingredient.ingredientId)?.quantity ?? 0;
		const max = getIngredientMaxQuantity(user.shopKeeper, ingredient.ingredientId);

		if (current + ingredient.quantity > max) {
			throw new ExpectedError('tooMuchIngredient');
		}
	}
}

export async function removeOfferContentFromInventoryTx(
	tx: Prisma.TransactionClient,
	userId: string,
	items: MarketItem[],
	ingredients: MarketIngredient[]
) {
	for (const item of items) {
		const updated = await tx.userItems.update({
			where: {
				itemId_userId: {
					itemId: item.itemId,
					userId
				}
			},
			data: {
				quantity: {
					decrement: item.quantity
				}
			}
		});

		if (updated.quantity <= 0) {
			await tx.userItems.delete({
				where: {
					itemId_userId: {
						itemId: item.itemId,
						userId
					}
				}
			});
		}
	}

	for (const ingredient of ingredients) {
		const updated = await tx.userIngredients.update({
			where: {
				ingredientId_userId: {
					ingredientId: ingredient.ingredientId,
					userId
				}
			},
			data: {
				quantity: {
					decrement: ingredient.quantity
				}
			}
		});

		if (updated.quantity <= 0) {
			await tx.userIngredients.delete({
				where: {
					ingredientId_userId: {
						ingredientId: ingredient.ingredientId,
						userId
					}
				}
			});
		}
	}
}

export async function addOfferContentToInventoryTx(
	tx: Prisma.TransactionClient,
	userId: string,
	items: MarketItem[],
	ingredients: MarketIngredient[]
) {
	for (const item of items) {
		await tx.userItems.upsert({
			where: {
				itemId_userId: {
					itemId: item.itemId,
					userId
				}
			},
			create: {
				itemId: item.itemId,
				userId,
				quantity: item.quantity
			},
			update: {
				quantity: {
					increment: item.quantity
				}
			}
		});
	}

	for (const ingredient of ingredients) {
		await tx.userIngredients.upsert({
			where: {
				ingredientId_userId: {
					ingredientId: ingredient.ingredientId,
					userId
				}
			},
			create: {
				ingredientId: ingredient.ingredientId,
				userId,
				quantity: ingredient.quantity
			},
			update: {
				quantity: {
					increment: ingredient.quantity
				}
			}
		});
	}
}
