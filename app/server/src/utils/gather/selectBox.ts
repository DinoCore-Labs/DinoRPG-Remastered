import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import weightedRandom from '../fight/weightedRandom.js';

/**
 * Roll and pick a random box.
 * Every 10th of completion, an extra roll is made. The roll with the highest tier is returned.
 * @param completion {number} completion of the player
 * @returns Box type
 */
export function selectBox(completion: number) {
	const boxOdds = [
		{ tier: 1, type: Item.BOX_COMMON, odds: 900 },
		{ tier: 2, type: Item.BOX_RARE, odds: 75 },
		{ tier: 3, type: Item.BOX_EPIC, odds: 24 },
		{ tier: 4, type: Item.BOX_LEGENDARY, odds: 1 }
	];
	const maxRolls = Math.floor(completion / 10) + 1;
	let reward = boxOdds[0]; // Pick common box as initial reward.
	let currentRoll = 0;
	while (currentRoll < maxRolls) {
		currentRoll++;
		const boxRoll = weightedRandom(boxOdds);
		// Use the rank to make this ID-agnostic
		if (boxRoll.tier > reward.tier) {
			reward = boxRoll;
		}
	}
	return itemList[reward.type];
}
