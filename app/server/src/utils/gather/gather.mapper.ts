import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { GatherData } from '@dinorpg/core/models/gather/gatherData.js';
import { gatherList } from '@dinorpg/core/models/gather/gatherList.js';
import { GatherRewards } from '@dinorpg/core/models/gather/gatherRewards.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import { Prisma, UserGather } from '../../../../prisma/index.js';
import { checkCondition } from '../checkCondition.js';
import { PlayerForConditionCheck } from '../user/userConditionCheck.js';

export const initializeGatherGrid = (userId: string, placeId: number, gridInformation: GatherData) => {
	const data: Prisma.UserGatherCreateInput = {
		user: { connect: { id: userId } },
		place: placeId,
		type: gridInformation.type
	};

	// Create arry with ingredientId. 0 for no element

	let grid: number[] = new Array(gridInformation.size * gridInformation.size);
	let ingredientCount = 0;

	// Generate a list of ingredient
	gridInformation.items.forEach(ingredient => {
		const buffer = new Array(ingredient.startQuantity);
		for (let i = 0; i < ingredient.startQuantity; i++) {
			let ingredientId = ingredient.ingredientId[Math.floor(Math.random() * ingredient.ingredientId.length)];
			if (ingredient.type === 'item') ingredientId += 1000;
			buffer[i] = ingredientId;
		}

		grid.splice(ingredientCount, ingredient.startQuantity, ...buffer);
		ingredientCount += ingredient.startQuantity;
	});

	// Fill the empty spot with 0
	grid = Array.from(grid, v => (v === undefined ? 0 : v));

	// Shuffle the ingredient list
	for (let i = grid.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[grid[i], grid[j]] = [grid[j], grid[i]];
	}

	data.grid = grid;

	return data;
};

export const hideGridIngredients = (grid: number[]) => {
	return grid.map(box => {
		if (box >= 0) return 0;
		return -1;
	});
};

export const getGridSize = (grid: Pick<UserGather, 'type'>) => {
	return gatherList[grid.type as GatherType].size;
};

export const getPublicGrid = (grid: Pick<UserGather, 'grid'>) => {
	return grid.grid.map(ingredient => (ingredient >= 0 ? 0 : -1));
};

export const discoverBox = (
	grid: Pick<UserGather, 'grid'>,
	user: PlayerForConditionCheck,
	gridInformation: GatherData,
	...box: [number, number][]
): {
	grid: number[][];
	rewards: GatherRewards;
	isGridComplete: boolean;
	goldReward: number;
	ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[];
} => {
	const flatReturnGrid = getPublicGrid(grid);
	const rewards: GatherRewards = { item: [], ingredients: [] };
	const isGridComplete = false;
	const goldReward = 0;
	const ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[] = [];
	for (let i = 0; i < box.length; i++) {
		let ingredientId: number = grid.grid[box[i][0] * gridInformation.size + box[i][1]];
		let itemCheck = false;
		if (ingredientId > 1000) {
			ingredientId -= 1000;
			itemCheck = true;
		}
		flatReturnGrid[box[i][0] * gridInformation.size + box[i][1]] = -1;

		if (itemCheck) {
			const item = itemList[ingredientId as Item];
			rewards.item.push({ id: item.itemId, price: item.price, maxQuantity: item.maxQuantity, quantity: 1 });
		} else {
			const ingredient = Object.values(ingredientList).find(
				ingredientFiche => ingredientFiche.ingredientId === ingredientId
			);
			if (ingredient) {
				const gridIngredient = gridInformation.items.filter(ing => ing.ingredientId.includes(ingredient.ingredientId));
				if (gridIngredient.length < 1) throw new Error('Ingredient not found in gridInformation.items');
				for (const possibleGater of gridIngredient) {
					if (checkCondition(possibleGater.condition, user, user.dinoz[0].id)) {
						ingredient.name = ingredient.name.toLowerCase();
						rewards.ingredients.push(ingredient);
					}
				}
			}
		}
	}

	// Unflatten the grid
	const returnGrid = [];
	for (let i = 0; i < flatReturnGrid.length; i += gridInformation.size) {
		returnGrid.push(flatReturnGrid.slice(i, i + gridInformation.size));
	}

	return {
		grid: returnGrid,
		rewards: rewards,
		isGridComplete,
		goldReward,
		ingredientsAtMaxQuantity
	};
};

export const saveGrid = (grid: Pick<UserGather, 'grid' | 'type'>, ...box: [number, number][]) => {
	for (let i = 0; i < box.length; i++) {
		grid.grid[box[i][0] * getGridSize(grid) + box[i][1]] = -1;
	}

	return {
		grid: grid.grid
	};
};
