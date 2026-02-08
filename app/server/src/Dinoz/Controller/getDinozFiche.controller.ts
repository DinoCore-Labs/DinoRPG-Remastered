import { prisma } from '../../prisma.js';

export async function getDinozFicheRequest(dinozId: number, userId: string) {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			wallets: {
				where: { type: 'GOLD' },
				select: { amount: true }
			},
			//engineer: true,
			items: {
				select: { itemId: true, quantity: true }
			},
			//quests: { select: { questId: true, progression: true } },
			rewards: { select: { rewardId: true } },
			ranking: { select: { dinozCount: true, points: true } },
			ingredients: { select: { ingredientId: true, quantity: true } },
			dinoz: {
				select: {
					id: true,
					display: true,
					life: true,
					maxLife: true,
					experience: true,
					nbrUpAir: true,
					nbrUpFire: true,
					nbrUpLightning: true,
					nbrUpWater: true,
					nbrUpWood: true,
					name: true,
					level: true,
					placeId: true,
					raceId: true,
					leaderId: true,
					//unavailableReason: true,
					fight: true,
					//gather: true,
					remaining: true,
					order: true,
					canRename: true,
					items: { select: { itemId: true } },
					status: { select: { statusId: true } },
					//missions: true,
					skills: { select: { skillId: true, state: true } },
					followers: { select: { id: true, fight: true, remaining: true, /*gather: true,*/ name: true } }
					//concentration: true,
					//TournamentTeam: { select: { tournamentId: true } },
					//build: true
				},
				where: {
					OR: [{ id: dinozId }, { leaderId: dinozId }]
				}
			}
		}
	});

	return user;
}
