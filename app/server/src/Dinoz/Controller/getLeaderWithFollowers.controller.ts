import { prisma } from '../../prisma.js';

export async function getLeaderWithFollowers(dinozId: number) {
	return await prisma.dinoz.findFirst({
		where: { followers: { some: { id: dinozId } } },
		select: {
			id: true,
			followers: { select: { id: true, skills: true, items: true, raceId: true } },
			skills: true,
			items: true,
			raceId: true
		}
	});
}
