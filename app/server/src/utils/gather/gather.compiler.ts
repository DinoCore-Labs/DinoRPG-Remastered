import { Condition } from '@dinorpg/core/models/conditions/conditions.js';
import { GatherType } from '@dinorpg/core/models/enums/GatherType.js';
import { GatherDataV2 } from '@dinorpg/core/models/gather/gatherDataV2.js';
import { GatherFound, GatherReward } from '@dinorpg/core/models/gather/gatherFound.js';
import { gatherListV2 } from '@dinorpg/core/models/gather/gatherListV2.js';
import { ingredientList } from '@dinorpg/core/models/ingredients/ingredientList.js';
import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { parseCondition } from '@dinorpg/core/models/utils/conditions/parseConditions.js';

export type CompiledGatherReward =
	| {
			kind: 'ingredient';
			ids: number[];
	  }
	| {
			kind: 'item';
			ids: number[];
			quantity: number;
	  }
	| {
			kind: 'gold';
			amount: number;
	  };

export interface CompiledGatherFound {
	reward: CompiledGatherReward;
	count: number;
	condition: Condition;
}

export interface CompiledGatherData {
	id: string;
	type: GatherType;
	action: GatherDataV2['action'];
	size: number;
	minimumClick: number;
	apparence: string;
	label: string;
	condition: Condition;
	found: CompiledGatherFound[];
	cost?: ItemFiche;
}

const TRUE_CONDITION: Condition = { type: 'true' };

const ingredientIdByKey = Object.fromEntries(
	Object.values(ingredientList).map(ingredient => [ingredient.name.toLowerCase(), ingredient.ingredientId])
);

const itemIdByKey = Object.fromEntries(Object.values(itemList).map(item => [item.name.toLowerCase(), item.itemId]));

function normalizeKey(value: string): string {
	return value.toLowerCase();
}

function resolveIngredientIds(keys: string[]): number[] {
	return keys.map(key => {
		const id = ingredientIdByKey[normalizeKey(key)];
		if (id === undefined) {
			throw new Error(`Unknown ingredient key in gather: "${key}"`);
		}
		return id;
	});
}

function resolveItemIds(keys: string[]): number[] {
	return keys.map(key => {
		const id = itemIdByKey[normalizeKey(key)];
		if (id === undefined) {
			throw new Error(`Unknown item key in gather: "${key}"`);
		}
		return id;
	});
}

function andCondition(left: Condition, right: Condition): Condition {
	return {
		type: 'and',
		left,
		right
	};
}

function compileActivation(raw: GatherDataV2): Condition {
	let compiled = raw.condition ? parseCondition(raw.condition) : TRUE_CONDITION;

	if (raw.skill) {
		compiled = andCondition(parseCondition(`skill(${raw.skill})`), compiled);
	}

	if (raw.object) {
		compiled = andCondition(parseCondition(`hasobject(${raw.object})`), compiled);
	}

	return compiled;
}

function compileReward(reward: GatherReward): CompiledGatherReward {
	switch (reward.kind) {
		case 'gold':
			return {
				kind: 'gold',
				amount: reward.amount
			};

		case 'ingredient':
			return {
				kind: 'ingredient',
				ids: resolveIngredientIds(reward.keys)
			};

		case 'item':
			return {
				kind: 'item',
				ids: resolveItemIds(reward.keys),
				quantity: reward.quantity ?? 1
			};
	}
}

function compileFound(entry: GatherFound): CompiledGatherFound {
	return {
		reward: compileReward(entry.reward),
		count: entry.count,
		condition: entry.condition ? parseCondition(entry.condition) : TRUE_CONDITION
	};
}

function compileGather(raw: GatherDataV2): CompiledGatherData {
	return {
		id: raw.id,
		type: raw.type,
		action: raw.action,
		size: raw.size,
		minimumClick: raw.minimumClick,
		apparence: raw.apparence,
		label: raw.label,
		condition: compileActivation(raw),
		found: raw.found.map(compileFound),
		cost: raw.cost
	};
}

export const compiledGatherList: Record<GatherType, CompiledGatherData> = Object.fromEntries(
	Object.entries(gatherListV2).map(([type, gather]) => [Number(type), compileGather(gather)])
) as Record<GatherType, CompiledGatherData>;

export function getCompiledGather(type: GatherType): CompiledGatherData {
	const gather = compiledGatherList[type];
	if (!gather) {
		throw new Error(`Unknown compiled gather type: ${String(type)}`);
	}
	return gather;
}
