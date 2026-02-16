import { prisma } from '../../prisma.js';

export async function getFollowingDinoz(dinozId: number) {
	return await prisma.dinoz.findUnique({
		where: {
			id: dinozId
		},
		select: {
			id: true,
			followers: { select: { id: true } },
			leaderId: true
		}
	});
}
