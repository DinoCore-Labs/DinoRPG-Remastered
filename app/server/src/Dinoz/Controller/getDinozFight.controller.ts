import { prisma } from '../../prisma.js';

export async function getDinozFightDataRequest(dinozId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			wallets: {
				where: { type: 'GOLD' },
				select: { amount: true }
			},
			items: { select: { itemId: true, quantity: true } },
			rewards: { select: { rewardId: true } },
			//quests: { select: { questId: true, progression: true } },
			ranking: { select: { dinozCount: true, points: true } },
			ingredients: { select: { ingredientId: true, quantity: true } },
			teacher: true,
			cooker: true,
			dinoz: {
				select: {
					id: true,
					display: true,
					userId: true,
					name: true,
					level: true,
					life: true,
					maxLife: true,
					experience: true,
					nbrUpFire: true,
					nbrUpWood: true,
					state: true,
					nbrUpWater: true,
					nbrUpLightning: true,
					nbrUpAir: true,
					placeId: true,
					leaderId: true,
					canRename: true,
					fight: true,
					items: { select: { itemId: true } },
					skills: {
						select: { skillId: true },
						where: { state: { equals: true } }
					},
					status: { select: { statusId: true } }
					//catches: { select: { id: true, hp: true, monsterId: true } },
					//missions: true,
					//concentration: true
				},
				where: {
					OR: [{ id: dinozId }, { leaderId: dinozId }]
				}
			}
		}
	});

	return user;
}
