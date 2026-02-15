import { prisma } from '../../prisma.js';

export async function getDinozGatherData(dinozId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			wallets: {
				where: { type: 'GOLD' },
				select: { amount: true }
			},
			//dailyGridRewards: true,
			items: { select: { id: true, itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			ingredients: true,
			//quests: { select: { questId: true, progression: true } },
			ranking: { select: { dinozCount: true, points: true } },
			dinoz: {
				select: {
					id: true,
					placeId: true,
					level: true,
					life: true,
					items: { select: { itemId: true } },
					gather: true,
					user: {},
					skills: { select: { skillId: true } },
					status: { select: { statusId: true } }
					//missions: { select: { missionId: true, isFinished: true } }
				},
				where: { id: dinozId }
			}
		}
	});

	return user;
}
