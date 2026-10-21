import { Item } from '@dinorpg/core/models/items/itemList.js';

import { prisma } from '../../prisma.js';

export async function dischargeDinozScale(dinozId: number) {
	const item = await prisma.dinozItems.findFirst({
		where: {
			itemId: Item.SCALE,
			dinozId
		},
		select: {
			id: true
		}
	});

	if (!item) {
		return;
	}

	await prisma.dinozItems.update({
		where: { id: item.id },
		data: { itemId: Item.SCALE_DISCHARGED }
	});
}
