import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import weightedRandom from '../fight/weightedRandom.js';

/**
 * Roll and pick a random box.
 * Every 10th of completion, an extra roll is made. The roll with the highest tier is returned.
 * @param completion {number} completion of the player
 * @returns Box type
 */
export function selectBox(completion: number) {
	let boxOdds = [];

	if (completion < 15) {
		boxOdds = [{ type: Item.BOX_COMMON, odds: 10 }];
	} else if (completion < 30) {
		boxOdds = [
			{ type: Item.BOX_COMMON, odds: 8 },
			{ type: Item.BOX_RARE, odds: 2 }
		];
	} else if (completion < 45) {
		boxOdds = [
			{ type: Item.BOX_COMMON, odds: 5 },
			{ type: Item.BOX_RARE, odds: 5 }
		];
	} else if (completion < 60) {
		boxOdds = [
			{ type: Item.BOX_COMMON, odds: 3 },
			{ type: Item.BOX_RARE, odds: 5 },
			{ type: Item.BOX_EPIC, odds: 2 }
		];
	} else if (completion < 70) {
		boxOdds = [
			{ type: Item.BOX_RARE, odds: 4 },
			{ type: Item.BOX_EPIC, odds: 5 },
			{ type: Item.BOX_LEGENDARY, odds: 1 }
		];
	} else if (completion < 80) {
		boxOdds = [
			{ type: Item.BOX_RARE, odds: 3 },
			{ type: Item.BOX_EPIC, odds: 6 },
			{ type: Item.BOX_LEGENDARY, odds: 1 }
		];
	} else if (completion < 90) {
		boxOdds = [
			{ type: Item.BOX_RARE, odds: 2 },
			{ type: Item.BOX_EPIC, odds: 6 },
			{ type: Item.BOX_LEGENDARY, odds: 2 }
		];
	} else {
		// 90 to 100%
		boxOdds = [
			{ type: Item.BOX_EPIC, odds: 7 },
			{ type: Item.BOX_LEGENDARY, odds: 3 }
		];
	}

	const boxRoll = weightedRandom(boxOdds);
	return itemList[boxRoll.type];
}
