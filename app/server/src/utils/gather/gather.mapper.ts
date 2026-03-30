import { ConditionsContext } from '@dinorpg/core/models/conditions/conditionsContext.js';
import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { GatherResult } from '@dinorpg/core/models/gather/gatherResult.js';
import { GatherRewards } from '@dinorpg/core/models/gather/gatherRewards.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { evalCondition } from '@dinorpg/core/models/utils/conditions/evalConditions.js';

import { Prisma, UserGather } from '../../../../prisma/index.js';
import {
	decodeGatherReward,
	EMPTY_GATHER_CELL,
	encodeGold,
	encodeIngredient,
	encodeItem,
	OPENED_GATHER_CELL
} from './gather.codec.js';
import { CompiledGatherData, getCompiledGather } from './gather.compiler.js';

function pickRandom<T>(values: T[]): T {
	return values[Math.floor(Math.random() * values.length)]!;
}

function buildRewardPool(gather: CompiledGatherData, context: ConditionsContext): number[] {
	const pool: number[] = [];

	for (const entry of gather.found) {
		if (!evalCondition(context, entry.condition)) {
			continue;
		}

		for (let index = 0; index < entry.count; index += 1) {
			switch (entry.reward.kind) {
				case 'ingredient':
					pool.push(encodeIngredient(pickRandom(entry.reward.ids)));
					break;

				case 'item':
					pool.push(encodeItem(pickRandom(entry.reward.ids), entry.reward.quantity));
					break;

				case 'gold':
					pool.push(encodeGold(entry.reward.amount));
					break;
			}
		}
	}

	return pool;
}

function shuffle<T>(values: T[]): T[] {
	const cloned = [...values];

	for (let index = cloned.length - 1; index > 0; index -= 1) {
		const swapIndex = Math.floor(Math.random() * (index + 1));
		[cloned[index], cloned[swapIndex]] = [cloned[swapIndex], cloned[index]];
	}

	return cloned;
}

export const initializeGatherGrid = (
	userId: string,
	placeId: number,
	gather: CompiledGatherData,
	context: ConditionsContext
): Prisma.UserGatherCreateInput => {
	const maxCells = gather.size * gather.size;
	const pool = buildRewardPool(gather, context);

	if (pool.length > maxCells) {
		throw new Error(`Gather "${gather.id}" has ${pool.length} rewards for only ${maxCells} cells.`);
	}

	const grid = [...pool];

	while (grid.length < maxCells) {
		grid.push(EMPTY_GATHER_CELL);
	}

	return {
		user: { connect: { id: userId } },
		place: placeId,
		type: gather.type,
		grid: shuffle(grid)
	};
};

export const hideGridIngredients = (grid: number[]) => {
	return grid.map(box => {
		if (box >= 0) return 0;
		return -1;
	});
};

export const getGridSize = (grid: Pick<UserGather, 'type'>) => {
	return getCompiledGather(grid.type as GatherType).size;
};

export const getPublicGrid = (grid: Pick<UserGather, 'grid'>) => {
	return grid.grid.map(value => (value >= 0 ? 0 : -1));
};

export const discoverBox = (
	grid: Pick<UserGather, 'grid'>,
	gather: CompiledGatherData,
	...box: [number, number][]
): GatherResult => {
	const flatReturnGrid = getPublicGrid(grid);

	const rewards: GatherRewards = {
		item: [],
		ingredients: [],
		gold: 0
	};

	const ingredientsAtMaxQuantity: { ingredientId: number; quantity: number; isMaxQuantity: boolean }[] = [];

	for (const [x, y] of box) {
		const index = x * gather.size + y;
		const cellValue = grid.grid[index];

		flatReturnGrid[index] = OPENED_GATHER_CELL;

		const reward = decodeGatherReward(cellValue);
		if (!reward) continue;

		switch (reward.kind) {
			case 'gold':
				rewards.gold += reward.amount;
				break;

			case 'item': {
				const item = Object.values(itemList).find(entry => entry.itemId === reward.itemId);
				if (!item) break;

				rewards.item.push({
					id: item.itemId,
					price: item.price,
					maxQuantity: item.maxQuantity,
					quantity: reward.quantity
				});
				break;
			}

			case 'ingredient': {
				const ingredient = Object.values(ingredientList).find(entry => entry.ingredientId === reward.ingredientId);
				if (!ingredient) break;

				rewards.ingredients.push({
					...ingredient,
					name: ingredient.name.toLowerCase()
				});
				break;
			}
		}
	}

	const returnGrid: number[][] = [];
	for (let index = 0; index < flatReturnGrid.length; index += gather.size) {
		returnGrid.push(flatReturnGrid.slice(index, index + gather.size));
	}

	return {
		grid: returnGrid,
		rewards,
		isGridComplete: false,
		gridCompletionGoldReward: 0,
		ingredientsAtMaxQuantity
	};
};

export const saveGrid = (grid: Pick<UserGather, 'grid' | 'type'>, ...box: [number, number][]) => {
	const newGrid = [...grid.grid];
	const size = getGridSize(grid);

	for (const [x, y] of box) {
		newGrid[x * size + y] = OPENED_GATHER_CELL;
	}

	return {
		grid: newGrid
	};
};
