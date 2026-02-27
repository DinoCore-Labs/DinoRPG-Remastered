import { prisma } from '../../prisma.js';

export async function getDinozFromItinerantShop(dinozId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			wallets: {
				where: { type: 'GOLD' },
				select: { amount: true }
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			items: { select: { itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			//quests: { select: { questId: true, progression: true } },
			ranking: { select: { dinozCount: true, points: true } },
			dinoz: {
				select: {
					id: true,
					placeId: true,
					level: true,
					life: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					//missions: { select: { missionId: true, isFinished: true } },
					skills: { select: { skillId: true } }
				},
				where: {
					id: dinozId
				}
			}
		}
	});
	return user;
}
