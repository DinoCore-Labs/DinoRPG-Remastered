import { ItemFiche } from '@dinorpg/core/models/items/itemFiche.js';
import { itemList } from '@dinorpg/core/models/items/itemList.js';
import { boxProbabilities } from '@dinorpg/core/models/items/itemProbability.js';
import { ExpectedError } from '@dinorpg/core/models/utils/expectedError.js';

import weightedRandom from '../fight/weightedRandom.js';

export function boxOpening(box: ItemFiche) {
	const myBox = Object.values(itemList).find(i => i.itemId === box.itemId);
	const myProba = boxProbabilities.find(b => b.boxType === myBox?.name);
	if (!myProba) {
		throw new ExpectedError(`Special item ${box.itemId} is not implemented`);
	}

	const myItem = weightedRandom(myProba.items);

	return { item: myItem.item, quantity: myItem.quantity };
}
