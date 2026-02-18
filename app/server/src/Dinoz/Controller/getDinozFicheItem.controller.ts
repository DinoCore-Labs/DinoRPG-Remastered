import { MoneyType } from '../../../../prisma/index.js';
import { prisma } from '../../prisma.js';

export async function getDinozFicheItemRequest(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			life: true,
			maxLife: true,
			experience: true,
			name: true,
			level: true,
			placeId: true,
			nbrUpWater: true,
			nbrUpWood: true,
			nbrUpAir: true,
			nbrUpLightning: true,
			nbrUpFire: true,
			raceId: true,
			user: {
				select: {
					id: true,
					//cooker: true,
					//lang: true,
					//shopKeeper: true,
					items: {
						select: { id: true, itemId: true, quantity: true }
					},
					wallets: {
						where: { type: MoneyType.GOLD },
						select: { type: true, amount: true }
					}
					//quests: { select: { questId: true, progression: true } }
				}
			},
			status: { select: { statusId: true } },
			skills: { select: { skillId: true } },
			unlockableSkills: { select: { skillId: true } }
		}
	});

	return dinoz;
}
