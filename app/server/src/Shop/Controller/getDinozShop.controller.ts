import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function getDinozShopDetailsRequest(dinozId: number) {
	const dinozShop = await prisma.userDinozShop.findUnique({
		where: {
			id: dinozId
		},
		select: {
			display: true,
			raceId: true,
			id: true,
			user: {
				select: {
					id: true,
					wallets: {
						where: { type: MoneyType.GOLD },
						select: { type: true, amount: true }
					},
					ranking: {
						select: {
							id: true,
							dinozCount: true,
							points: true,
							average: true
						}
					}
				}
			}
		}
	});

	return dinozShop;
}
