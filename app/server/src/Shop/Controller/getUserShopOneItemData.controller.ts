import { Item, itemList } from '@dinorpg/core/models/items/itemList.js';

import { DinozState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function getUserShopOneItemDataRequest(userId: string, itemId: number) {
	const user = await prisma.user.findUniqueOrThrow({
		where: {
			id: userId
		},
		select: {
			id: true,
			wallets: {
				where: { type: { in: ['GOLD', 'TREASURE_TICKET'] } },
				select: { type: true, amount: true }
			},
			merchant: true,
			shopKeeper: true,
			items: {
				select: {
					id: true,
					itemId: true,
					quantity: true
				},
				where: {
					itemId: { in: [itemId, itemList[Item.GOLDEN_NAPODINO].itemId] }
				}
			},
			dinoz: {
				select: {
					placeId: true,
					status: { select: { statusId: true } }
				},
				where: {
					OR: [{ state: null }, { state: { not: { in: [DinozState.frozen, DinozState.sacrificed] } } }]
				}
			},
			rewards: true
		}
	});

	return user;
}
