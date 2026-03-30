export const EMPTY_GATHER_CELL = 0;
export const OPENED_GATHER_CELL = -1;

const INGREDIENT_OFFSET = 1_000_000;
const ITEM_OFFSET = 2_000_000;
const GOLD_OFFSET = 3_000_000;

const ITEM_ID_FACTOR = 1_000;
const ITEM_QUANTITY_FACTOR = 1;

export type EncodedGatherReward =
	| {
			kind: 'ingredient';
			ingredientId: number;
	  }
	| {
			kind: 'item';
			itemId: number;
			quantity: number;
	  }
	| {
			kind: 'gold';
			amount: number;
	  };

export function encodeIngredient(ingredientId: number): number {
	return INGREDIENT_OFFSET + ingredientId;
}

export function encodeItem(itemId: number, quantity: number): number {
	return ITEM_OFFSET + itemId * ITEM_ID_FACTOR + quantity * ITEM_QUANTITY_FACTOR;
}

export function encodeGold(amount: number): number {
	return GOLD_OFFSET + amount;
}

export function decodeGatherReward(value: number): EncodedGatherReward | null {
	if (value === EMPTY_GATHER_CELL || value === OPENED_GATHER_CELL) {
		return null;
	}

	if (value >= GOLD_OFFSET) {
		return {
			kind: 'gold',
			amount: value - GOLD_OFFSET
		};
	}

	if (value >= ITEM_OFFSET) {
		const raw = value - ITEM_OFFSET;
		const itemId = Math.floor(raw / ITEM_ID_FACTOR);
		const quantity = raw % ITEM_ID_FACTOR;

		return {
			kind: 'item',
			itemId,
			quantity: quantity || 1
		};
	}

	if (value >= INGREDIENT_OFFSET) {
		return {
			kind: 'ingredient',
			ingredientId: value - INGREDIENT_OFFSET
		};
	}

	return null;
}
