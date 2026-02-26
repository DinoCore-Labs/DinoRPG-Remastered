import { DinozState } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function getUserShopItemsDataRequest(userId: string) {
	const user = await prisma.user.findUnique({
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
					itemId: true,
					quantity: true
				}
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
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
			}
		}
	});

	return user;
}
