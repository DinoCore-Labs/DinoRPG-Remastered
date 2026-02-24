import { prisma } from '../../prisma.js';

export async function getDinozToReincarnate(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			skills: {
				select: { skillId: true }
			},
			status: {
				select: { statusId: true }
			},
			items: {
				select: { itemId: true }
			},
			display: true,
			id: true,
			seed: true,
			raceId: true,
			life: true,
			level: true,
			experience: true,
			nbrUpAir: true,
			nbrUpFire: true,
			nbrUpLightning: true,
			nbrUpWater: true,
			nbrUpWood: true
		}
	});
}
