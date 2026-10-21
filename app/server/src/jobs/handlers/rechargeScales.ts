import { Item } from '@dinorpg/core/models/items/itemList.js';

import { prisma } from '../../prisma.js';

export async function rechargeScalesJob() {
	const updatedEquipped = await prisma.dinozItems.updateMany({
		where: { itemId: Item.SCALE_DISCHARGED },
		data: { itemId: Item.SCALE }
	});

	const updatedInventory = await prisma.userItems.updateMany({
		where: { itemId: Item.SCALE_DISCHARGED },
		data: { itemId: Item.SCALE }
	});

	return {
		rechargedEquipped: updatedEquipped.count,
		rechargedInventory: updatedInventory.count
	};
}
