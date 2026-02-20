import { prisma } from '../../prisma.js';

export async function getAllDinozFromAccount(userId: string) {
	const dinozList = await prisma.dinoz.findMany({
		where: {
			userId
		},
		select: {
			id: true,
			leaderId: true,
			name: true,
			//unavailableReason: true,
			level: true,
			placeId: true,
			canRename: true,
			life: true,
			maxLife: true,
			experience: true,
			nbrUpFire: true,
			nbrUpWood: true,
			nbrUpWater: true,
			nbrUpLightning: true,
			nbrUpAir: true,
			status: true,
			skills: true,
			unlockableSkills: true
		}
	});

	return dinozList;
}
