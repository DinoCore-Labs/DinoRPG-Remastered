import { prisma } from '../../prisma.js';

export async function getDinozForLevelUp(dinozId: number) {
	const dinoz = await prisma.dinoz.findUnique({
		where: { id: dinozId },
		select: {
			id: true,
			maxLife: true,
			raceId: true,
			name: true,
			display: true,
			experience: true,
			level: true,
			nextUpElementId: true,
			nextUpAltElementId: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			canRename: true,
			state: true,
			seed: true,
			user: {
				select: {
					id: true,
					//discoveredSkills: true,
					ranking: { select: { points: true, average: true, dinozCount: true } }
				}
			},
			items: { select: { itemId: true } },
			skills: { select: { skillId: true } },
			unlockableSkills: { select: { skillId: true } },
			status: { select: { statusId: true } }
		}
	});

	return dinoz;
}
