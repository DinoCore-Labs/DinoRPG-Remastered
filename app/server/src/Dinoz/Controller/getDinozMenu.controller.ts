import { prisma } from '../../prisma.js';

export async function getDinozMenuRequest(userId: string) {
	return prisma.user.findUnique({
		where: {
			id: userId
		},
		select: {
			id: true,
			wallets: {
				where: {
					type: 'GOLD'
				},
				select: {
					amount: true
				}
			},
			engineer: true,
			items: {
				select: {
					itemId: true,
					quantity: true
				}
			},
			rewards: {
				select: {
					rewardId: true
				}
			},
			ranking: {
				select: {
					dinozCount: true,
					points: true
				}
			},
			ingredients: {
				select: {
					ingredientId: true,
					quantity: true
				}
			},
			dinoz: {
				orderBy: [
					{
						order: 'asc'
					},
					{
						id: 'asc'
					}
				],
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
					state: true,
					stateTimer: true,
					fight: true,
					gather: true,
					remaining: true,
					order: true,
					canRename: true,
					items: {
						select: {
							itemId: true
						}
					},
					status: {
						select: {
							statusId: true
						}
					},
					missions: true,
					skills: {
						select: {
							skillId: true,
							state: true
						}
					},
					followers: {
						select: {
							id: true,
							fight: true,
							remaining: true,
							gather: true,
							name: true
						}
					}
				}
			}
		}
	});
}
